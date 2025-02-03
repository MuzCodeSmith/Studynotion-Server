// models
const Course = require('../models/Course');
const Tag = require('../models/Tag')
const User = require('../models/User');

// utils
const {uploadImageToCloudinary} = require('../utils/imageUplaoder');
require('dotenv').config()

exports.createCourse = async (req,res) => {
    try {
        
        const {courseName,courseDescription,price,whatYouWillLearn,tag} = req.body;
        
        const thumbnail = req.files.thumbnailImage;

        if(!courseName || !courseDescription || !price || !whatYouWillLearn || !tag || !thumbnail ){
            return res.json(401).json({
                success:true,
                message:"All fields are required"
            })
        }

        // check for instructor
        let userId = req.user.id
        let instructorDetails = await User.findById(userId);
        
        if(!instructorDetails){
            return res.json(400).json({
                success:false,
                message:"Instructor details not found!"
            })
        }

        // check if tag valid or not
        let tagDetails = await Tag.findById(tag);
        if(tagDetails){
            return res.json(400).json({
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

        return res.json(201).json({
            success:true,
            message:"Course created successfully!",
            data:newCourse
        })

    } catch (error) {
        console.error(error);
        return res.json(401).json({
                success:false,
                message:"error while creating course"
            })
    }
};

exports.showAllCources = async (req,res) =>{
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

        return res.json(200).json({
            success:true,
            data:allCources,
            message:"all courses fetched successfully!"
        })
    } catch (error) {
        console.error(error)
        return res.json(500).json({
            success:false,
            message:"failed to fetch all cources"
        })
    }
}