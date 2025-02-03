const Section = require('../models/Section');
const Cource = require('../models/Course');

exports.createSection = async (req,res) =>{
    try {
        const {sectionName, courseId} = req.body;
        if(!sectionName || !courseId){
            return res.json(500).json({
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
        );

        return res.json(201).json({
            success:false,
            message:"Section Created successfully"
        })
    } catch (error) {
        return res.json(500).json({
            success:false,
            message:"error while creating Section"
        })
    }
}
