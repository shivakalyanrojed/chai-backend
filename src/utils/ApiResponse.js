class ApiResponse{
    constructor(
        statusCode,
        data,
        message='Sucess'
    ){
        this.statusCode = statusCode;
        this.message = message;
        this.sucess = statusCode<400;
        this.data = data;
        this.error = [];
    }
}

export {ApiResponse};