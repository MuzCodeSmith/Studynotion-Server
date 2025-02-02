const Tag = require('../models/Tag');

exports.createTag = async (req,res) =>{
    try {
        const {name,description} = req.body;
        if(!name || !description){
            return res.json(401).json({
                success:false,
                message:"Please fill all necessary details"
            })
        }
        const tagDetails = await Tag.create({
            name, description
        });

        return res.json(201).json({
            success:true,
            data:tagDetails,
            message:"Tag created successfully"
        })

    } catch (error) {
        return res.json(500).json({
            success:false,
            message:"error while creating tag"
        })
    }
}

exports.showAllTags = async (req,res) =>{
    try {
        const allTags = await Tag.find({},{name:true,description:true});
        return res.json(200).json({
            success:true,
            tags:allTags,
            message:"All tags fetched successfully"
        })
    } catch (error) {
        
    }
}