import kotlinx.serialization.json.*
import org.apache.flink.api.java.utils.ParameterTool
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment
import java.io.IOException
import java.util.*
import kotlin.random.Random


private fun defaultParameters(): ParameterTool {
    return ParameterTool.fromMap(mapOf(
        // Database
        "db-endpoint" to System.getenv("DB_HOST")+":"+System.getenv("DB_PORT"),
        "db-uname" to System.getenv("DB_USER"),
        "db-password" to System.getenv("DB_PASS"),
        "db-database" to System.getenv("DB_DATABASE"),
        "db-schema" to System.getenv("DB_SCHEMA"),
        "db-table" to "data",
        "interval-sec" to "10",
        "batch-size" to "30",
        // Http
        "timeout-sec" to "10",
        "ipfs-gateway" to "https://cloudflare-ipfs.com/,https://cf-ipfs.com/",
        "ipfs-gateway-private" to "https://onfnft.infura-ipfs.io",
        "ipfs-gateway-token" to "***",
        "http-para" to "2",
    ))
}

fun main(args: Array<String>) {

    val params: ParameterTool = defaultParameters().mergeWith(ParameterTool
        .fromArgs(args))

    app(params)
}

fun app(params: ParameterTool) {
    val random = Random.Default

    val env = StreamExecutionEnvironment.getExecutionEnvironment().enableCheckpointing(10000)
    val dataStream = env.addSource(SQLSource(params["db-endpoint"], params["db-uname"], params["db-password"], params["db-database"], params["db-schema"], params["db-table"], params.getLong("interval-sec")*1000L, params.getInt("batch-size")))
    dataStream
        .map{ decodeURI(it) }
        .map{ IO.resolveWithIO(it, random, params["ipfs-gateway"].split(","), params["ipfs-gateway-private"], params["ipfs-gateway-token"], params) }.setParallelism(params.getInt("http-para"))
        .map{ unknownStatus(it) }
        .map{ fillFields(it) }
        .addSink(SQLSink(params))
    env.execute("Metadata scraper")
}

fun getJsonField(jobj: JsonObject, keyName: String): String? {
    val obj = jobj[keyName]
    if (obj != null && obj is JsonPrimitive) {
        return obj.content
    }
    return null
}

fun fillFields(metadata: Metadata): Metadata {
    if (metadata.raw != null) {
        try {
            val obj = Json.parseToJsonElement(metadata.raw!!).jsonObject
            metadata.name = getJsonField(obj, "name")
            metadata.symbol = getJsonField(obj, "symbol")
            metadata.token_uri = getJsonField(obj, "token_uri")
            metadata.image_uri = getJsonField(obj, "image")
            metadata.description = getJsonField(obj, "description")
            metadata.raw = obj.toString()
        } catch (e: Exception) {
            e.printStackTrace()
            metadata.raw = "{\"raw\": \"" + Base64.getEncoder().encodeToString(metadata.raw!!.toByteArray())+ "\"}"
            metadata.metadata_status = Status.FAILED.toString()
        }
    }
    return metadata
}

fun decodeURI(metadata: Metadata): Metadata {
    if (metadata.metadata_uri.startsWith("data:application/json;base64,")) {
        try {
            val base64Data = metadata.metadata_uri.substringAfter("data:application/json;base64,")
            val decodedBytes = Base64.getDecoder().decode(base64Data)
            val jsonString = String(decodedBytes, Charsets.UTF_8)
            metadata.raw = jsonString
            metadata.metadata_status = Status.COMPLETED.toString()
        } catch (e: IOException) {
            e.printStackTrace()
            metadata.metadata_status = Status.FAILED.toString()
        }
    } else if (metadata.metadata_uri.startsWith("{")) {
        try {
            val obj = Json.parseToJsonElement(metadata.metadata_uri!!).jsonObject
            getJsonField(obj, "name")!!
            metadata.raw = obj.toString()
            metadata.metadata_status = Status.COMPLETED.toString()
        } catch (e: IOException) {
            e.printStackTrace()
            metadata.metadata_status = Status.FAILED.toString()
        }
    }
    return metadata
}

fun unknownStatus(metadata: Metadata): Metadata {
    if (metadata.metadata_status == Status.PENDING.toString()) {
        metadata.metadata_status = Status.UNKNOWN.toString()
    }
    println(metadata.metadata_status + ":" +  metadata.metadata_uri)
    return metadata
}