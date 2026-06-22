class ApiResponse {
    constructor(statusCode, data, token = null, message = "Success") {
        this.statusCode = statusCode
        this.data = data
        this.message = message,
            this.token = token
    }
}


export { ApiResponse }