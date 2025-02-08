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

exports.categoryPageDetails = async (req,res) =>{
    try {
        const {categoryId} =req.body;
        // fetchin category details by id
        const selectedCategory = await Category.findById({_id:categoryId})
                                                .populate('courses')
                                                .exec();
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:`selected category details not found!`
            })  
        }
        // other categories
        const differentCategories = await Category.find({
            _id:{$ne:categoryId},
        })
        .populate('courses')
        .exec();

        //get top selling courses


        return res.status(500).json({
            success:true,
            data:{
                selectedCategory,
                differentCategories
            }
        })  

    } catch (error) {
        return res.json(500).json({
            success:false,
            message:"error while fetching Category Page Details"
        })
    }
}
