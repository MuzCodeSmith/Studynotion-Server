// models
const { findByIdAndUpdate } = require("../models/Profile");
const User = require("../models/User");
// packages
const mailSender = require("../utils/mailsender") 
const bcrypt = require('bcrypt');
// resetPasswordToken

exports.resetPasswordToken = async (req,res)=>{
    try {
        // get email fro request 
        const email = req.body.email;
        // validating email
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success:false,
                message:"Your email not registered with us!"
            })
        }
        // generating token 
        const token = crypto.randomUUID();
        // udpate user by addding token and expiration time
        const updatedDeatails = await User.findOneAndUpdate({email:email},{
            token:token,
            resetPasswordExpires: Date.now() + 5*60*1000,  
        },{new:true})

        // creating URL
        const url = `http://localhost:3000/update-password/${token}`;
        // send mail
        await mailSender(email,'Reset Password',`Reset Password Link: ${url}`)

        return res.json({
            success:true,
            message:"Email sent successfully, please check your inbox"
        })

    } catch (error) {
        console.error(error)
        return res.json({
            success:false,
            message:"Something went wrong while reset password mail"
        })
    }
}

// reset Password
exports.resetPassword = async (req, res) =>{
    try {
        // extracting data from request
        const {password, confirmPassword, token} = req.body;
        // validating data
        if(password !== confirmPassword) {
            return res.json(401).json({
                success:false,
                message:"password not matching"
            })
        }
        // fetching user details using token
        const userDetails = await User.findOne({token:token});
        if(!userDetails){
            return res.json(401).json({
                success:false,
                message:"token is invalid"
            })
        }
        // check token expiry
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.json(401).json({
                success:false,
                message:"token is expired "
            })
        }
        // hashing password
        const hashedPassword = await bcrypt.hash(password,10)

        // updating userdetails
        const updatedDeatails = await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true}
        );

        res.status(200).status({
            success:true,
            message:"Password resetted successfully"
        })
        
    } catch (error) {
        console.error(error)
        return res.json({
            success:false,
            message:"Something went wrong while resetting password"
        })
    }
}