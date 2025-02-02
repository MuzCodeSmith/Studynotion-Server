// models
const User = require('../models/User');
const OTP = require('../models/OTP');
const Profile = require('../models/Profile')

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


expots.signUp = async (req,res) =>{
    try {

        const {firstName,lastName,email,password,confirmPassword,accountType, contactNumber,otp} = req.body;

        // validating 
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(401).json({
                success:false,
                message:"All fields are required",

            })
        }
        if(password !== confirmPassword ){
            return res.status(400).json({
                success:false,
                message:"password is not matches with confirm password",

            })
        }

        // existing user
        let existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already exists",

            })
        }

        // find most recent otp for user
        let recentOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log("recentOTP:",recentOTP)
        if(recentOTP.length == 0){
            // otp not found
            return res.status(400).json({
                success:false,
                message:"otp not found"
            })
        }else if(otp !== recentOTP.otp){
            return res.status(400).json({
                success:false,
                message:"invalid otp"
            })
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        res.status(201).json({
            success:true,
            Message:"User created Successfully",
            User
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
} 