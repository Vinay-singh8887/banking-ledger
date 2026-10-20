 const mongoose = require("mongoose");
  const bcrypt = require('bcryptjs')

 const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required for creating a user"],
        trim:true,
        lowercase:true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
        unique:[true,"Email already exist."] 
    },
    name:{
        type:String,
        required:[true,"Name is rquired for creating an account"]
    },

    password:{
        type:String,
        required:[true,"Password is necessary"],
        minlength:[6,"Password shloud be atleast 6 character long."],
        select:false

    },
    systemUser:{
        type:Boolean,
        default:false,
        immutable:true,
        select:false
    }
 },
 {
    timestamps:true
 })

 userSchema.pre("save",async function() {
     
    if(!this.isModified("password")){
        return;
    }

    const hash = await bcrypt.hash(this.password,10)
    this.password = hash;
    return ;
 
 })

 userSchema.methods.comparePassword = async function (password)  { 
   
    return await bcrypt.compare(password,this.password)
 }

 const usermodel = mongoose.model("user",userSchema)

 module.exports = usermodel;

 


