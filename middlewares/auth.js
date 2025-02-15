// models
const User = require('../models/User');

// packages
const jwt  = require('jsonwebtoken');
require('dotenv').config()

// auth
exports.auth = async (req,res,next) =>{
    try {

        // extracting token 
        const token = req.cookies.token 
                    || req.body.token 
                    || req.header('Authorization').repalce("Bearer ","");

        if(!token){
            return res.status(401).json({
                success:false,
                message:'token not found'
            })
        }

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET)
            req.user = decode; 

        } catch (error) {
            return res.status(400).json({
                success:false,
                message:'token is invalid'
            })
        }
        next();
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Something went wrong while validating the token "
        })
    }
}
// isStudent
exports.isStudent = async (req,res,next) =>{
    try {
        if(req.user.accountType !== "Student"){
            return res.status(400).json({
                success:false,
                message:"this is protected route for students only"
            })
        }
        next()
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"User role cannnot be verified!"
        })
    }
}

// isInstructor
exports.isInstructor = async (req,res,next) =>{
    try {
        if(req.user.accountType !== "Instructor"){
            return res.status(400).json({
                success:false,
                message:"this is protected route for Instructor only"
            })
        }
        next()
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"User role cannnot be verified!"
        })
    }
}

// isAdmin
exports.isAdmin = async (req,res,next) =>{
    try {
        if(req.user.accountType !== "Admin"){
            return res.status(400).json({
                success:false,
                message:"this is protected route for Admin only"
            })
        }
        next()
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"User role cannnot be verified!"
        })
    }
}