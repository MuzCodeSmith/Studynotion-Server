const mongoose = require('mongoose');
require('dotenv').config()

exports.connect = async () =>{
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>console.log('connection to database successful'))
    .catch((error)=>{
        console.log("failed to connect database!");
        console.error(error);
        process.exit(1);
    })
}