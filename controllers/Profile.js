const Profile = require('../models/Profile');
const User = require('../models/User');

const { uploadImageToCloudinary } = require("../utils/imageUplaoder")

exports.updateProfile = async (req,res) =>{
    try {
        const {
            firstName = "",
            lastName = "",
            dateOfBirth = "",
            about = "",
            contactNumber = "",
            gender = "",
          } = req.body

        // get user id
        const userId = req.user.id;

        // validation
        // if(!contactNumber || !about || !dateOfBirth || !gender){
        //     return res.status(500).json({
        //         success:false,
        //         message:"all field are required"
        //     })  
        // }

        // fetching userdetails
        const userDetails = await User.findById(userId);
        const profileDetails = await Profile.findById(userDetails.additionalDetails)


        // save the details in user collections
        const user = await User.findByIdAndUpdate(userId, {
            firstName,
            lastName,
          })
        // await user.save()

        profileDetails.contactNumber = contactNumber;
        profileDetails.about = about;
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.gender = gender;
         await profileDetails.save()

        return res.status(200).json({
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

exports.deleteAccount = async (req,res) =>{
    try {
        const userId = req.user.id;


        // fetch user details
        const userDetails = await User.findById(userId);
        if(!userDetails){
            return res.status(500).json({
                success:false,
                message:"user details not available"
            })  
        }
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

        // todo:if user enrolled any course also remove from their

        await User.findByIdAndDelete({_id:userId});

        return res.status(500).json({
            success:true,
            message:"User deleted successfully"
        })  

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"error while deleting profile"
        })  
    }
}

exports.getAllUserDetails = async (req,res) =>{
    try {
        const userId = req.user.id;
        // fetch user details
        const userDetails = await User.findById(userId).populate('additionalDetails').exec();

        return res.status(200).json({
                success:true,
                message:"profile details fetched successfully",
                data:userDetails
        })  

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"error while fetching profile details"
        })  
    }
}
exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )


      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
  