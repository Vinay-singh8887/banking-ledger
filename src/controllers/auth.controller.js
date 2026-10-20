const usermodel = require('../models/user.model')
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service')
const blacklistmodel = require('../models/blacklist.model')



async function userRegister(req,res){
    const{name,email,password}=req.body;

    const isexist = await usermodel.findOne({
        email:email,
    })

    if(isexist){
        return res.status(422).json({
            message:"User already exist with this eamil.",
            status:"failed" 
        })
    }

    const user = await usermodel.create({
        email,password,name
    }) 

    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{expiresIn: "3d"})
      
    res.cookie("token",token)
    res.status(201).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        }, 
         token 
    }) 

    await emailService.sendRegisterationEmail(user.email,user.name)
}

async function userlogin(req,res) {

    const {email,password}=req.body;

    const user = await usermodel.findOne({email}).select("+password")

    if(!user){
        return res.status(401).json({
            message:"Email or password is invalid"
        })
    }

    const isValid = await user.comparePassword(password)

    if(!isValid){
        return res.status(401).json({
            message:"Email or Password is invalid"
        })
    }

    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{expiresIn:"3d"})
     res.cookie("token",token)

     res.status(200).json({
        user:{
            _id:user._id,
             email:user.email,
              name:user.name 
       },
       token
     })
    
}

async function userLogout(req,res){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
   
    if(!token){
        return res.status(400).json({
            message:"Token is required to logout"
        }) 
    }
    res.clearCookie("token")

    await blacklistmodel.create({ 
       token
    })
    res.status(200).json({
        message:"User logged out successfully"
    })
}

module.exports = {userRegister,userlogin,userLogout}