import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
import org.apache.flink.api.common.typeinfo.Types
import org.apache.flink.api.java.typeutils.RowTypeInfo
import org.apache.flink.connector.jdbc.JdbcInputFormat
import org.apache.flink.streaming.api.datastream.DataStream
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment
import org.apache.flink.streaming.api.functions.sink.SinkFunction
import org.apache.flink.table.api.bridge.java.StreamTableEnvironment
import org.apache.flink.types.Row
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


data class Metadata(val id: String, var metadata: String, var metadata_url: String, var metadata_status: String)
enum class Status {
    PENDING,
    FAILED,
    COMPLETED;

    override fun toString(): String {
        return name
    }
}

fun main(args: Array<String>) {

    val env = StreamExecutionEnvironment.getExecutionEnvironment()

    val jdbcInputFormat = JdbcInputFormat.buildJdbcInputFormat()
        .setDrivername("org.postgresql.Driver")
        .setDBUrl("jdbc:postgresql://localhost:5432/postgres")
        .setUsername("moss")
        .setPassword("moss")
        .setQuery("SELECT * FROM my_schema.data")
        .setRowTypeInfo(RowTypeInfo(Types.STRING, Types.STRING, Types.STRING, Types.STRING))
        .finish()

    val stream: DataStream<Row> = env.createInput(jdbcInputFormat)
    val fakeStream = stream.map { row ->
        var metadata = row.getField(1) as String?
        if (metadata == null) {
            metadata = ""
        }
        Metadata(
            (row.getField(0) as String?)!!,
            metadata,
            (row.getField(2) as String?)!!,
            (row.getField(3) as String?)!!
        )
    }

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

    val afterBase64 = fakeStream.map { decodeBase64(it) }
    val afterIPFSStream: DataStream<Metadata> = afterBase64.map { resolveIpfs(it, random, httpHostUrls) }
    val modifiedDataStream: DataStream<Metadata> = afterIPFSStream.map { resolveHttp(it) }
//    modifiedDataStream.print()
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
                    connection!!.prepareStatement("INSERT INTO my_schema.data (id, metadata_url, metadata ) VALUES (?, ?, ?) ON CONFLICT (id) DO UPDATE SET metadata_url = EXCLUDED.metadata_url, metadata = EXCLUDED.metadata")
            }
            insertStatement!!.setString(1, value.id)
            insertStatement!!.setString(2, value.metadata_url)
            insertStatement!!.setString(3, value.metadata)
//            insertStatement!!.setString(4, value.metadata_status)
            insertStatement!!.executeUpdate()
        } finally {
            insertStatement?.close()
            connection?.close()
        }
    }
}
