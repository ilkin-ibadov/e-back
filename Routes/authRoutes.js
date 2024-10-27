const express= require("express");
const router=express.Router();
const bcrypt=require("bcrypt");
const User=require("../models/user");
const generateAccessToken=require("../utils/generateAccessToken");
const generateRefreshToken=require("../utils/generateRefreshToken");
const REFRESH_TOKEN_SECRET=process.env.REFRESH_TOKEN_SECRET;
const jwt=require("jsonwebtoken");

router.post("/register", async (req,res)=>{
    try{
        const{firstName,lastName,email,isAdmin,password}=req.body;
        
        const passwordHash=await bcrypt.hash(password,10);
        
        const user=new User({firstName,lastName,email,isAdmin,passwordHash});
        
        await user.save();
        
        res.status(201).send({ message: "User registered successfully" });
    
    }catch(err){
        res.status(500).send("Error registering user");
    }
});

router.post("/login", async (req,res)=>{
    const{email,password}=req.body;

    const user = await User.findOne({email});

    if(!user) return res.status(400).send("Invalid email");

    const validPassword=await bcrypt.compare(password,user.passwordHash);

    if(!validPassword) return res.status(400).send("Invalid password");

    const accessToken= generateAccessToken(user);
    const refreshToken=generateRefreshToken(user);
    res.json({accessToken,refreshToken});


});


router.post("/refresh",async(req,res)=>{
    const refreshToken=req.body.refreshToken;
    
    if(!refreshToken) return res.sendStatus(401);

    jwt.verify(refreshToken,REFRESH_TOKEN_SECRET,(err,user)=>{
        console.log(err)
        if(err) return res.sendStatus(401);

        const accessToken=generateAccessToken(user);
        
        res.json({accessToken:accessToken});
    });
});

module.exports=router;