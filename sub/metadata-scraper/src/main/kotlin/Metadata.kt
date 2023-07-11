data class Metadata(val id: String,var metadata_uri: String, var metadata_status: String, var raw: String?, var name: String?, var symbol: String?, var token_uri: String?, var image_uri: String?, var description: String?)
enum class Status {
    PENDING,
    COMPLETED,
    FAILED,
    UNKNOWN;

    override fun toString(): String {
        return name
    }
}
