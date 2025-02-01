const mongoose = require('mongoose');

const userScema = new mongoose.Schema({
    firstName :{
        type:String,
        required:true,
        trim:true
    },
    lastName :{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
        trim:true,
    },
    accountType:{
        type:String,
        enum:['Admin','Student','Instructor'],
        required:true,
    },
    additionlDetails:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Profile'
    },
    cources:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course'
        }
    ],
    image:{
        type:String,
        required:true,
    },
    courseProgress:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'CourseProgress'
    },
    

})