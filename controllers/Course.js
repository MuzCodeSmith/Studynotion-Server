// models
const Course = require('../models/Course');
const User = require('../models/User');
const Category = require('../models/Category')

// utils
const {uploadImageToCloudinary} = require('../utils/imageUplaoder');
require('dotenv').config()

exports.createCourse = async (req,res) => {
    try {
        
        const userId = req.user.id

        let {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag,
            category,
            status,
            instructions,
          } = req.body
        
        const thumbnail = req.files.thumbnailImage;

         // Convert the tag and instructions from stringified Array to Array
        // const tag = JSON.parse(_tag)
        // const instructions = JSON.parse(_instructions)

        if (
            !courseName ||
            !courseDescription ||
            !whatYouWillLearn ||
            !price ||
            !tag ||
            !thumbnail ||
            !category
            ) {
            return res.status(400).json({
                success: false,
                message: "All Fields are Mandatory",
            })
        }


        if (!status || status === undefined) {
            status = "Draft"
          }
          // Check if the user is an instructor
          const instructorDetails = await User.findById(userId, {
            accountType: "Instructor",
          })
        
          if (!instructorDetails) {
            return res.status(404).json({
              success: false,
              message: "Instructor Details Not Found",
            })
          }
      

          // Check if the tag given is valid
        const categoryDetails = await Category.findById(category)
        if (!categoryDetails) {
        return res.status(404).json({
            success: false,
            message: "Category Details Not Found",
        })
        }

         // Upload the Thumbnail to Cloudinary
        const thumbnailImage = await uploadImageToCloudinary(
            thumbnail,
            process.env.FOLDER_NAME
        )


      // Create a new course with the given details
        const newCourse = await Course.create({
        courseName,
        courseDescription,
        instructor: instructorDetails._id,
        whatYouWillLearn: whatYouWillLearn,
        price,
        tag,
        category: categoryDetails._id,
        thumbnail: thumbnailImage.secure_url,
        status: status,
        instructions,
        })


          // Add the new course to the User Schema of the Instructor
        await User.findByIdAndUpdate(
            {
            _id: instructorDetails._id,
            },
            {
            $push: {
                courses: newCourse._id,
            },
            },
            { new: true }
        )

          // Add the new course to the Categories
        const categoryDetails2 = await Category.findByIdAndUpdate(
            { _id: category },
            {
            $push: {
                courses: newCourse._id,
            },
            },
            { new: true }
        )
        


         // Return the new course and a success message
        res.status(200).json({
            success: true,
            data: newCourse,
            message: "Course Created Successfully",
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
        const courseDetails = await Course.findOne({_id:courseId})
        // .populate({
        //     path: "instructor",
        //     populate: {
        //       path: "additionalDetails",
        //     },
        //   })
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
            message:'course details fetched successfully',
            courseDetails
        })  
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:`could not find the course with course`
        })  
    }
}