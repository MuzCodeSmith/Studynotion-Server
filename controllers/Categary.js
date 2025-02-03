const Category = require('../models/Category');

exports.createCategory = async (req,res) =>{
    try {
        const {name,description} = req.body;
        if(!name || !description){
            return res.json(401).json({
                success:false,
                message:"Please fill all necessary details"
            })
        }
        const categoryDetails = await Category.create({
            name, description
        });

        return res.json(201).json({
            success:true,
            data:categoryDetails,
            message:"Category created successfully"
        })

    } catch (error) {
        return res.json(500).json({
            success:false,
            message:"error while creating Category"
        })
    }
}

exports.showAllCategories = async (req,res) =>{
    try {
        const allCategories = await Category.find({},{name:true,description:true});
        return res.json(200).json({
            success:true,
            tags:allCategories,
            message:"All Categories fetched successfully"
        })
    } catch (error) {
        return res.json(500).json({
            success:false,
            message:"error while creating Category"
        })
    }
}