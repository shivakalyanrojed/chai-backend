class ApiResponse{
    constructor(
        statusCode,
        message='Sucess',
        data
    ){
        this.statusCode = statusCode;
        this.message = message;
        this.sucess = statusCode<400;
        this.data = data;
        this.error = [];
    }
}