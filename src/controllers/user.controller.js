import  {asyncHandler}  from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import { User } from '../models/User.models.js';
import { uploadonCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
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
    
    const existedUser = await User.findOne({
        $or:[{email},{username}]
    })
    if (existedUser){
        throw new ApiError(409,"User already exists with this email or username");
    }

    console.log(req.files)
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

const generateAcessandRefreshToken = async(userId)=>{
        try{
            const user = await User.findById(userId);
            console.log(user);
            
            const accessToken = await user.generateAccessToken();
            const refreshToken = await user.generateRefreshToken();
        
            user.refreshToken = refreshToken;
            user.save({validateBeforeSave:false});
            
            
            return {accessToken,refreshToken};

        }catch(error){ 
            throw new ApiError(500,"Could not generate tokens, please try again later");
        }
    }

const loginUser = asyncHandler (async(req,res)=>{
    //requset body ->data
    //username or email
    //find the user
    //check for password 
    //acess and refresh token
    //send cookies
    const {email,password,username}=req.body;

    if (!username && !password){
        throw new ApiError(400,"Username and password are required");
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })
    if (!user){
        throw new ApiError(404,"User not found with this email or username");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid){
        throw new ApiError(401,"Invalid password");
    }

    const {accessToken,refreshToken} = await generateAcessandRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        '-password -refreshToken'
    )

    //cookies only modified from server side
    const options = {
        httpOnly:true,
        secure:true,
    }

    return res.status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(
        new ApiResponse(200,loggedInUser,'User logged in successfully')
    )

})

const logoutUser = asyncHandler(async(req,res)=>{
    //get user from req
    //clear cookies
    //remove refresh token from db
    
    await User.findByIdAndUpdate(req.user._id,
        {
        $set:{
            refreshToken:undefined
        }
    }
    ,{
        new:true
    }
    );
    const options = {
        httpOnly:true,
        secure:true,
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User logged out successfully")
    )
})


const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.
    refreshToken || req.body.refreshToken
    if (!incomingRefreshToken){
        throw new ApiError(401,"Refresh token is missing");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken._id)
    
        if (!user){
            throw new ApiError(404,"User not found");
        }
    
        if (incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401,"Invalid refresh token");
        }
    
        const options = {
            httpOnly:true,
            secure:true,
        }
    
        const {accessToken,newrefreshToken} = await generateAcessandRefreshToken(user._id)
    
        return res.status(200).
        cookie("refreshToken",newrefreshToken,options)
        .cookie("accessToken",accessToken,options)
        .json(
            new ApiResponse(200,{
                accessToken, refreshToken:newrefreshToken,
            },"Access token refreshed successfully")
        )
    } catch (error) {
        throw new ApiError(401,"Invalid refresh token");
    }
    
})



export {registerUser,loginUser,logoutUser, refreshAccessToken};