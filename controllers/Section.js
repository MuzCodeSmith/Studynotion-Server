const Section = require('../models/Section');
const SubSection = require('../models/SubSection')
const Course = require('../models/Course');

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
        const updatedCourse = await Course.findByIdAndUpdate(courseId,
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

exports.deleteSection = async (req, res) => {
	try {

		const { sectionId, courseId }  = req.body;
		await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})
		const section = await Section.findById(sectionId);
		console.log(sectionId, courseId);
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

		//delete sub section
		await SubSection.deleteMany({_id: {$in: section.subSection}});

		await Section.findByIdAndDelete(sectionId);

		//find the updated course and return 
		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();

		res.status(200).json({
			success:true,
			message:"Section deleted",
			data:course
		});
	} catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};   