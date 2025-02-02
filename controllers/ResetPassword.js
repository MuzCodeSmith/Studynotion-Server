const User = require("../models/User");
const mailSender = require("../utils/mailsender") 
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