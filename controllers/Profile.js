const Profile = require('../models/Profile');
const User = require('../models/User');

exports.updateProfile = async (req,res) =>{
    try {
        const {contactNumber,about='',dateOfBirth='',gender} = req.body;

        // get user id
        const userId = req.user.id;

        // validation
        if(!contactNumber || !about || !dateOfBirth || !gender){
            return res.status(500).json({
                success:false,
                message:"all field are required"
            })  
        }

        // fetching userdetails
        const userDetails = await User.findById(userId);

        // fetching profile details
        const profileId = userDetails.additionlDetails;
        const profileDetails = await Profile.findById(profileId)
        profileDetails.contactNumber = contactNumber;
        profileDetails.about = about;
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.gender = gender;
        await profileDetails.save()

        return res.status(500).json({
            success:true,
            message:"profie updated successfully",
            data:profileDetails
        })  

        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"error while updating profile"
        })  
    }
}