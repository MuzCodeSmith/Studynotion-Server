const {instance} = require('../config/razorpay')
const User = require('../models/User');
const Course = require('../models/Course');
const mailSender = require('../utils/mailsender');
const { default: mongoose } = require('mongoose');

// capture the payment and intialize razorpay order
exports.capturePayment = async (req,res) =>{
    const {courseId} = req.body;
    const userId = req.user.id;

    if(!courseId){
        return res.status(400).json({
            success:false,
            message:"please provide valid course id"
        })  
    }
    
    let course;
    try {
        course = await Course.findById(courseId);
        if(course){
            return res.status(400).json({
                success:false,
                message:'course not found!'
            })
        }
        // check if user already paid for the same course
        const uid = new mongoose.Types.ObjectId(courseId);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(400).json({
                success:false,
                message:"User is already enrolled!"
            })
        }
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })  
    }
}