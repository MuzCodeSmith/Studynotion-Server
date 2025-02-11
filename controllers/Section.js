const Section = require('../models/Section');
const Cource = require('../models/Course');

exports.createSection = async (req,res) =>{
    try {
        const {sectionName, courseId} = req.body;
        if(!sectionName || !courseId){
            return res.status(401).json({
                success:false,
                message:"All fields are required"
            })
        }
        const newSection = await Section.create({sectionName});

        //upadating course with new section
        const updatedCourse = await Cource.findByIdAndUpdate(courseId,
            {
               $push:{courseContent:newSection._id} 
            },
            {new:true}
        ).populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
        .exec();

        console.log("updatedCourse: ",updatedCourse)



        return res.status(201).json({
            success:true,
            message:"Section Created successfully",
            updatedCourse
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"error while creating Section"
        })
    }
}

exports.updateSection = async (req,res)=>{
    try {
        const {sectionName, sectionId} = req.body;
        // validation
        if(!sectionName || !sectionId){
            return res.status(401).json({
                success:false,
                message:"All fields are required"
            })
        }
        // update course
        const updatedSection = await Section.findByIdAndUpdate(sectionId, {sectionName},{new:true})
    
        return res.status(201).json({
            success:true,
            data:updatedSection,
            message:"Section Created successfully"
        })
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"error while creating Section"
        })   
    }
}

exports.deleteSection = async (req,res) => {
    try {
        const {sectionId} = req.params;
        
        await Section.findByIdAndDelete(sectionId);

        // also need to delete from Course model

        return res.status(200).json({
            success:true,
            message:"Section deleted successfully"
        })  
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Section delted successfully!"
        })  
    }
}