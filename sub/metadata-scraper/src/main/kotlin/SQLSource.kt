import org.apache.flink.configuration.Configuration
import org.apache.flink.streaming.api.functions.source.RichSourceFunction
import org.apache.flink.streaming.api.functions.source.SourceFunction
import java.sql.Connection
import java.sql.DriverManager
import java.sql.PreparedStatement
import Metadata

class SQLSource(
    private val db_endpoint: String,
    private val db_uname: String,
    private val db_password: String,
    private val db_database: String,
    private val db_schema: String,
    private val db_table: String,
    private val interval_millis: Long,
    private val batch_size: Int,
) : RichSourceFunction<Metadata>() {
    private var connection: Connection? = null
    private var preparedStatement: PreparedStatement? = null

    @Throws(Exception::class)
    override fun open(parameters: Configuration) {
        super.open(parameters)
        Class.forName("org.postgresql.Driver")
    }

    override fun run(ctx: SourceFunction.SourceContext<Metadata>?) {
        while (true) {
            try {
                connection = DriverManager.getConnection("jdbc:postgresql://${db_endpoint}/${db_database}?autoReconnect=true&maxReconnects=10&connectTimeout=10000", db_uname, db_password)
                preparedStatement = connection?.prepareStatement("SELECT * FROM \"${db_schema}\".${db_table} WHERE raw IS NULL AND metadata_status = 'PENDING' ORDER BY id LIMIT $batch_size")
                val resultSet = preparedStatement?.executeQuery()
                while (resultSet?.next() == true) {
                    val record = Metadata(
                        resultSet.getString("id"),
                        resultSet.getString("metadata_uri"),
                        resultSet.getString("metadata_status"),
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                    )
                    ctx?.collect(record)
                }
            } catch (e: Exception) {
                e.printStackTrace()
                throw e
            } finally {
                preparedStatement?.close()
                connection?.close()
            }
            Thread.sleep(interval_millis)
        }
    }

    override fun cancel() {
    }
}
