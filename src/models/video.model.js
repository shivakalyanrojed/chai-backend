import mongoose from "mongoose";
// Video Schema
const videoSchema = new mongoose.Schema(
    {
        VideoFile:{
            type:String, //cloudinary url
            required:true,
        },
        thumbnial:{
            type:String, //cloudinary url
            required:true,
        },
        title:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true,
        },
        duration:{
            type:Number,
            required:true,
        },
        views:{
            type:Number,
            default:0,
        },
        isPublished:{
            type:Boolean,
            default:true,
        },
        Owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        }

    },{timestamps:true}
)



export const Video = mongoose.model("Video",videoSchema);