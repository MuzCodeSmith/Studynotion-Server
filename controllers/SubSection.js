const SubSection = require('../models/SubSection');
const Section = require('../models/Section');
const {uploadImageToCloudinary} = require('../utils/imageUplaoder')
require('dotenv').config()

exports.createSubSection = async (req,res) =>{
    try {
        const {SectionId, title, timeDuration, description} = req.body;
        const video = req.files.videoFile;

        if(!SectionId || !title || !timeDuration || !description || !video ){
            return res.json(401).json({
                success:false,
                message:"All fields are required"
            })  
        }
        // upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME)

        const subSectionDetails = await SubSection.create({
            title,
            description,
            timeDuration,
            videoUrl:uploadDetails.secure_url,
        }) 

        const updatedSection = await Section.findByIdAndUpdate({_id:SectionId},
                {
                    $push:{subSection:subSectionDetails._id}
                },
                {new:true}
            )
            
        // add populat query
        return res.status(200).json({
            success:true,
            message:"created Section successfully",
            updatedSection
        })  
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"error while creating Sub Section"
        })  

    }
}