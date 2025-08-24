// Utility to handle async request handlers
const asyncHandler = (requestHandler) =>{
    return (req,res,next) =>{
        Promise.resolve(requestHandler(req,res,next)).
        catch((error) =>next(error))
    }
}

export {asyncHandler}