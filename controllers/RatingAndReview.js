const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');
const User = require('../models/User');
const { default: mongoose } = require('mongoose');

exports.createRating = async (req, res) => {
    try {
        const userId = req.user.id;

        const { rating, review, courseId } = req.body;
        // check is user Enrolled or not
        const courseDetails = await Course.findOne({
            _id: courseId,
            studentsEnrolled: { $elemMatch: { $eq: userId } }
        });
        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: `student is not enrolled in this course`
            })
        }
        // check if user already rated the course
        const alreadyReviewed = await RatingAndReview.findOne({ user: userId, course: courseId });
        if (alreadyReviewed) {
            return res.status(404).json({
                success: false,
                message: "course is already reviewed by user"
            })
        }

        // create rating
        const ratingReview = await RatingAndReview.create({
            rating,
            review,
            user: userId,
            course: courseId
        })
        // updating in the course collection
        const updatedCourse = await Course.findByIdAndUpdate({ _id: courseId },
            {
                $push: { ratingAndReviews: ratingReview._id }
            },
            { new: true });
        return res.status(200).json({
            success: true,
            message: `review and rating added successfully`,
            ratingReview
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'error while rating: ' + error.message
        })
    }
}

exports.getAverageRating = async (req,res) => {
    try {
        const courseId = req.body.courseId;

        // calculate rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"}
                }
            }
        ])

        if(result.length > 0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating
            })  
        }
        // if no rating /review exists
        return res.status(400).json({
            success:false,
            message:"no ratings given till now",
            averageRating:0

        })  
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:`error occured while calculating average of rating: ${error.message}`
        })     
    }
}

exports.getAllRating = async (req,res) =>{
    try {
        const allReviews = await RatingAndReview.find()
        .sort({rating:'desc'})
        .populate(
            {
                path:"user",
                select:"firstName lastName email image"
            }
        ) 
        .populate(
            {
                path:"course",
                select:"coursName"
            }) 
        .exec(); 

        return res.status(200).json({
            success:true,
            message:"All ratings are fetched successfully!",
            data:allReviews
        })  
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:`error occured while get all ratings: ${error.message}`
        })  
    }
}