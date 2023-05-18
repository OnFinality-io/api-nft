import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
import org.apache.flink.api.java.typeutils.RowTypeInfo
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment
import org.apache.flink.streaming.api.functions.sink.SinkFunction
import org.apache.flink.table.api.*
import java.io.BufferedReader
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URI
import java.net.URL
import java.sql.Connection
import java.sql.DriverManager
import java.sql.PreparedStatement
import java.util.*
import kotlin.random.Random
import org.apache.flink.api.common.typeinfo.Types;
//import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.datastream.DataStream;
//import org.apache.flink.table.api.bridge.java.StreamTableEnvironment;
import org.apache.flink.table.api.EnvironmentSettings;
import org.apache.flink.connector.jdbc.JdbcInputFormat;
//import org.apache.flink.api.java.io.jdbc.JDBCInputFormat;
import org.apache.flink.api.java.tuple.Tuple2;
import org.apache.flink.api.java.utils.ParameterTool
import org.apache.flink.table.api.bridge.scala.StreamTableEnvironment
//import org.apache.flink.api.java.typeutils.RowTypeInfo;
import org.apache.flink.types.Row;



data class Metadata(val id: Int, val metadata_url: String, var metadata: String, var metadata_status: String)
enum class Status {
    PENDING,
    FAILED,
    COMPLETED;

    override fun toString(): String {
        return name
    }
}

fun main(args: Array<String>) {

    // Setup the stream execution environment
//    val env = StreamExecutionEnvironment.getExecutionEnvironment()
//    val settings = EnvironmentSettings.newInstance().inStreamingMode().build()
//    val tEnv = StreamTableEnvironment.create(env, settings)
//
//    val ddl = """
//        CREATE TABLE data (
//            id INT,
//            metadata STRING,
//            metadata_url STRING,
//            -- define other fields here
//            PRIMARY KEY (id) NOT ENFORCED
//        ) WITH (
//            'connector' = 'jdbc',
//            'url' = 'jdbc:postgresql://localhost:5432/testdb',
//            'table-name' = 'my_schema.data',
//            'username' = 'moss',
//            'password' = 'moss'
//        )
//    """.trimIndent()
//
//    tEnv.executeSql(ddl)
//
//    val result = tEnv.sqlQuery("SELECT * FROM data")
//
//    result.execute().print()

    val env = StreamExecutionEnvironment.getExecutionEnvironment()
    val params = ParameterTool.fromArgs(args)
    env.config.globalJobParameters = params

    val fakeDataStream: DataStream<Metadata> = env.fromElements(
        Metadata(1, "ipfs://QmQGsXVt5o8Qf2J3to21RJYdHsNZQaVFosPYNSMS5CHW7U/2.json", "", "PENDING"),
        Metadata(2, "https://arweave.net/KTpuWvFpa8Fgj7t1dUVwZ2yhpfHWMcN8vkziGrwxbcg", "", "PENDING"),
        Metadata(3, "data:application/json;base64,eyJpZCI6IDEyM30K", "", "PENDING"),
    )

    val httpHostUrls = listOf(
        "https://cloudflare-ipfs.com/",
        "https://cf-ipfs.com/",
        "https://gateway.pinata.cloud/",
        "https://4everland.io/",
        "https://ipfs.yt/",
        "https://gateway.ipfs.io/",
        "https://ipfs.io/",
    )
    val random = Random.Default

    val afterBase64 = fakeDataStream.map { decodeBase64(it) }
    val afterIPFSStream: DataStream<Metadata> = afterBase64.map { resolveIpfs(it, random, httpHostUrls) }
    val modifiedDataStream: DataStream<Metadata> = afterIPFSStream.map { resolveHttp(it) }
    modifiedDataStream.addSink(PostgresSink())
    env.execute("Flink Kotlin PostgreSQL Demo")
}

fun decodeBase64(metadata: Metadata): Metadata {
    if (metadata.metadata_url.startsWith("data:application/json;base64,")) {
        val base64Data = metadata.metadata_url.substringAfter("data:application/json;base64,")
        val decodedBytes = Base64.getDecoder().decode(base64Data)
        val jsonString = String(decodedBytes, Charsets.UTF_8)
        metadata.metadata = jsonString
        metadata.metadata_status = Status.COMPLETED.toString()
    }
    return metadata
}

suspend fun httpGet(url: String, retries: Int = 3): String = withContext(Dispatchers.IO) {
    var attempts = 0
    while (attempts < retries) {
        try {
            val connection = URL(url).openConnection() as HttpURLConnection
            try {
                return@withContext connection.inputStream.bufferedReader().use(BufferedReader::readText)
            } finally {
                connection.disconnect()
            }
        } catch (e: IOException) {
            attempts++
            if (attempts == retries) throw e
            delay(1000L * attempts)
        }
    }
    throw IOException("Failed to make HTTP request after $retries attempts")
}

fun resolveIpfs(metadata: Metadata, random: Random, httpHostUrls: List<String>): Metadata {
    if (metadata.metadata_url.startsWith("ipfs")) {
        val randomUrls = httpHostUrls.shuffled(random).take(2)
        val url = URI(randomUrls[0]).resolve("ipfs/").resolve(URI(metadata.metadata_url.substringAfter("ipfs://")))
        val metadataContent = runBlocking {
            httpGetSafe(url.toString(), randomUrls[1])
        }
        metadata.metadata = metadataContent
        metadata.metadata_status = Status.COMPLETED.toString()
    }
    return metadata
}

suspend fun httpGetSafe(url: String, fallbackUrl: String): String {
    return try {
        httpGet(url)
    } catch (e: IOException) {
        httpGet(fallbackUrl)
    }
}

fun resolveHttp(metadata: Metadata): Metadata {
    if (metadata.metadata_url.startsWith("http")) {
        val metadataContent = runBlocking {
            httpGetSafe(metadata.metadata_url, metadata.metadata_url)
        }
        metadata.metadata = metadataContent
        metadata.metadata_status = Status.COMPLETED.toString()
    }
    return metadata
}

class PostgresSink : SinkFunction<Metadata> {
    private var connection: Connection? = null
    private var insertStatement: PreparedStatement? = null
    override fun invoke(value: Metadata) {
        try {
            if (connection == null) {
                Class.forName("org.postgresql.Driver")
                connection = DriverManager.getConnection("jdbc:postgresql://localhost:5432/testdb", "moss", "moss")
                insertStatement =
                    connection!!.prepareStatement("INSERT INTO my_schema.data (id, metadata_url, metadata) VALUES (?, ?, ?) ON CONFLICT (id) DO UPDATE SET metadata_url = EXCLUDED.metadata_url, metadata = EXCLUDED.metadata")
            }
            insertStatement!!.setInt(1, value.id)
            insertStatement!!.setString(2, value.metadata_url)
            insertStatement!!.setString(3, value.metadata)
            insertStatement!!.executeUpdate()
        } finally {
            insertStatement?.close()
            connection?.close()
        }
    }
}
