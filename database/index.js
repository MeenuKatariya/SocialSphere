const mongoose = require("mongoose");

const connectDB = async() =>{
    try{
      await mongoose.connect("mongodb://localhost:27017/socialSphere");
      console.log("Mongodb Connect Successfully")
    }catch(err){
        console.log(err)
    }
}

module.exports = { connectDB}