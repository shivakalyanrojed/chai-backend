import  {asyncHandler}  from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import { User } from '../models/User.models.js';
import { uploadonCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler (async(req,res)=>{
    //get user details from frontend
    //validation - not empty
    //check if user already exists
    //check for images and avatar
    //upload images to cloudinary, avatar
    //create user oject -upload in db
    //remove password and refresh token from response
    //check for user creation 
    //return res

    const {username,email,fullname,password} = req.body;
    console.log('email:',email);

    if ( [fullname,username,email,password].some((field) =>
        field?.trim()==="")){
            throw new ApiError(400,"All fields are required");
        }
    
    const existedUser = User.findOne({
        $or:[{email},{username}]
    })
    if (existedUser){
        throw new ApiError(409,"User already exists with this email or username");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImagePath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath){
        throw new ApiError(400,"Avatar is required");
    }

    const avatar = await uploadonCloudinary(avatarLocalPath);
    const coverImage = await uploadonCloudinary(coverImagePath);

    if (!avatar){
        throw new ApiError(500,"Could not upload avatar, please try again later");
    };

    const user = await User.create({
        username:username.toLowerCase(),
        email,
        fullname,
        password,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        
    })

    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken'
    )

    if (!createdUser){
        throw new ApiError(500,"User not created, please try again later");
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User created successfully")
    )
});

export {registerUser};