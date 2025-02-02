// models
const User = require('../models/User');
const OTP = require('../models/OTP');

//pacakges
const otpGenerator = require('otp-generator') 


// otp controller
exports.sendOTP = async (req,res) =>{
    try {
        
        const {email} = req.body;

        let isUserPresent = await User.findOne({email});

        if(isUserPresent){
            return res.status(401).json({
                success:false,
                message:"User already exist"
            })
        }

        // generate opt
        let otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
        })
        console.log("generated otp: ",otp);

        // check if otp is unique or not
        let isNotUniqueOTP = await OTP.findOne({otp:otp});

        while(isNotUniqueOTP){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false
            })
            isNotUniqueOTP = await OTP.findOne({otp:otp});
        }

        const otpPayload = {email,otp};

        const otpBody = await OTP.create(otpPayload);
        console.log("otpBody:",otpBody)

        res.status(201).json({
            success:true,
            message:"OTP sent successfully",
            otp
        })



    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}