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

    // order create
    const ammount = course.price;
    const currency = "INR";

    const options = {
        ammount:ammount * 100,
        currency,
        receipt:Math.random(Date.now()).toString(),
        notes:{
            courseId,
            userId
        }

    }

    try {
        // intiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options)
        console.log("paymentResponse:",paymentResponse)

        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            ammount:paymentResponse.ammount
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'failed to intiate order!'
        })
    }
}

// verify signature of Razorpay and Server
exports.verifySignature = async (req,res) =>{
    const webhookSecret = "12345678";

    const signature = req.headers['x-razorpay-signature'];
    const shasum = crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest){
        console.log("Payment is Authorized")
    }
}