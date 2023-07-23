import kotlinx.coroutines.runBlocking
import org.apache.flink.api.java.utils.ParameterTool
import java.net.URI
import Metadata
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import java.io.BufferedReader
import java.io.IOException
import java.net.HttpURLConnection
import java.net.SocketTimeoutException
import java.net.URL
import kotlin.random.Random

class IO {
    companion object {
        fun resolveWithIO(metadata: Metadata, random: Random, httpHostUrls: List<String>, privateGateway: String, privateGatewayToken: String, params: ParameterTool): Metadata {
            if (metadata.metadata_uri.startsWith("ipfs")) {
                try {
                    val randomUrls = httpHostUrls.shuffled(random).take(2)
                    val url0 = URI(privateGateway).resolve("ipfs/").resolve(URI(metadata.metadata_uri.substringAfter("ipfs://")))
                    val url1 = URI(randomUrls[1]).resolve("ipfs/").resolve(URI(metadata.metadata_uri.substringAfter("ipfs://")))
                    val metadataContent = runBlocking {
                        httpGetSafe(url0.toString(), url1.toString(), params.getInt("timeout-sec"), privateGatewayToken)
                    }
                    metadata.raw = metadataContent.toString()
                    metadata.metadata_status = Status.COMPLETED.toString()
                } catch (e: Exception ) {
                    metadata.metadata_status = Status.FAILED.toString()
                }
            }
            if (metadata.metadata_uri.startsWith("http")) {
                try {
                    val metadataContent = runBlocking {
                        httpGetSafe(metadata.metadata_uri.replace("http:", "https:"), metadata.metadata_uri, params.getInt("timeout-sec"))
                    }
                    metadata.raw = metadataContent.toString()
                    metadata.metadata_status = Status.COMPLETED.toString()
                } catch (e: Exception) {
                    metadata.metadata_status = Status.FAILED.toString()
                }
            }
            return metadata
        }

    }
}

suspend fun httpGet(url: String, timeout: Int, token: String? = null, retries: Int = 3): JsonElement = withContext(
    Dispatchers.IO) {
    println("HTTP CALL $url")
    var attempts = 0
    while (attempts < retries) {
        try {
            val connection = URL(url).openConnection() as HttpURLConnection
            connection.instanceFollowRedirects = true
            connection.connectTimeout = timeout * 1000
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36")
            if (token != null) {
                connection.setRequestProperty("Authorization", "Basic $token")
            }
            val newL = connection.getHeaderField("Location")
            if (newL != null) {
                return@withContext httpGet(newL, timeout)
            }
            try {
                val response = connection.inputStream.bufferedReader().use(BufferedReader::readText)
                return@withContext Json.parseToJsonElement(response)
            } finally {
                connection.disconnect()
            }
        } catch (e: SocketTimeoutException) {
            attempts++
            if (attempts == retries) throw e
        } catch (e: Exception) {
            throw e
        }

    }
    throw IOException("Failed to make HTTP request after $retries attempts")
}

suspend fun httpGetSafe(url: String, fallbackUrl: String, timeout: Int, token4url: String? = null): JsonElement {
    return try {
        httpGet(url, timeout, token4url)
    } catch (e: IOException) {
        httpGet(fallbackUrl, timeout, token4url)
    }
}
