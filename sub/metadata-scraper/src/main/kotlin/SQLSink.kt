import org.apache.flink.api.java.utils.ParameterTool
import org.apache.flink.streaming.api.functions.sink.SinkFunction
import java.io.IOException
import java.sql.Connection
import java.sql.DriverManager
import java.sql.PreparedStatement
import Metadata

class SQLSink(private val params: ParameterTool) : SinkFunction<Metadata> {
    private var connection: Connection? = null
    private var insertStatement: PreparedStatement? = null
    override fun invoke(value: Metadata) {
        try {
            if (connection == null) {
                Class.forName("org.postgresql.Driver")
                connection = DriverManager.getConnection(
                    "jdbc:postgresql://${params["db-endpoint"]}/${params["db-database"]}",
                    "${params["db-uname"]}",
                    "${params["db-password"]}"
                )
                insertStatement =
                    connection!!.prepareStatement("INSERT INTO \"${params["db-schema"]}\".${params["db-table"]} (id, metadata_uri, metadata_status, raw, name, symbol, token_uri, image_uri, description ) VALUES (?, ?, \"${params["db-schema"]}\".\"842d2921b5\"(?), jsonb(?), ?, ?, ?, ?, ?) ON CONFLICT (id) DO UPDATE SET metadata_uri = EXCLUDED.metadata_uri, raw = EXCLUDED.raw, metadata_status = EXCLUDED.metadata_status, name = EXCLUDED.name, symbol = EXCLUDED.symbol, token_uri = EXCLUDED.token_uri, image_uri = EXCLUDED.image_uri, description = EXCLUDED.description")
            }
            insertStatement!!.setString(1, value.id)
            insertStatement!!.setString(2, value.metadata_uri)
            insertStatement!!.setString(3, value.metadata_status)
            insertStatement!!.setString(4, value.raw)
            insertStatement!!.setString(5, value.name)
            insertStatement!!.setString(6, value.symbol)
            insertStatement!!.setString(7, value.token_uri)
            insertStatement!!.setString(8, value.image_uri)
            insertStatement!!.setString(9, value.description)
            insertStatement!!.executeUpdate()
        } catch (e: IOException) {
            e.printStackTrace()
            throw e
        } finally {
        }
    }
}
