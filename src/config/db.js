const mongoose = require("mongoose");

function connectdb(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Connected to Mongo DB")
    })
    .catch(err=>{
        console.log("Error conneting to db")
        process.exit(1)
    })
}

module.exports = connectdb;