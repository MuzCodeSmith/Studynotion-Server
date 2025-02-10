// models
const Course = require('../models/Course');
const User = require('../models/User');

// utils
const {uploadImageToCloudinary} = require('../utils/imageUplaoder');
require('dotenv').config()

exports.createCourse = async (req,res) => {
    try {
        
        const {courseName,courseDescription,price,whatYouWillLearn,tag} = req.body;
        
        const thumbnail = req.files.thumbnailImage;

        console.log("reached here")
        

        if(!courseName || !courseDescription || !price || !whatYouWillLearn || !tag || !thumbnail ){
            return res.status(401).json({
                success:true,
                message:"All fields are required"
            })
        }


        // check for instructor
        let userId = req.user.id
        let instructorDetails = await User.findById(userId);
        
        if(!instructorDetails){
            return res.status(400).json({
                success:false,
                message:"Instructor details not found!"
            })
        }

        // check if tag valid or not
        let tagDetails = await Tag.findById(tag);
        if(tagDetails){
            return res.status(400).json({
                success:false,
                message:"tag details not found!"
            })
        }

        // upload thumbnail to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

        // create entry in db of new cource
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            price,
            whatYouWillLearn,
            instructor:instructorDetails._id,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url
        })

        // add the new course in the user scheama of instructor
        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id
                }
            },
            {new:true}
        )

        // add the new course in the Tag scheama
        await Tag.findByIdAndUpdate(
            {_id:tagDetails._id},
            {
                $push:{
                    courses:newCourse._id
                }
            }
        )

        return res.status(201).json({
            success:true,
            message:"Course created successfully!",
            data:newCourse
        })

    } catch (error) {
        console.error(error);
        return res.status(401).json({
                success:false,
                message:"error while creating course"
            })
    }
};

exports.getAllCourses = async (req,res) =>{
    try {
        // change the below statement increamentally
        const allCources = await Course.find({},{
            courseName:true,
            price:true,
            thumbnail:true,
            instructor:true,
            studentsEnrolled:true,
            ratingAndReviews:true   
        }).populate('instructor').exec();

        return res.status(200).json({
            success:true,
            data:allCources,
            message:"all courses fetched successfully!"
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success:false,
            message:"failed to fetch all cources"
        })
    }
}

exports.getCourseDetails = async (req,res)=>{
    try {
        const {courseId} = req.body;
        // find course details
        const courseDetails = await Course.find({_id:courseId}).populate(
                {
                    path:"instructor",
                    populate:{
                        path:"additionlDetails"
                    }
                }
            )
            .populate('category')
            .populate('ratingAndReviews')
            .populate({
                path:"courseContent",
                populate:{
                    path:"subSection"
                }
            })
            .exec();
        if(!courseDetails){
            return res.status(200).json({
                success:false,
                message:`could not find the course with ${courseId}`
            })  
        }
        res.status(200).json({
            success:true,
            message:'course details fetched successfully'
        })  
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:`could not find the course with course`
        })  
    }
}