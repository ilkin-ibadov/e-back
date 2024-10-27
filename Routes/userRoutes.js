const express=require("express");
const router=express.Router();
const {authenticateAccessToken}=require("../middleware/authenticateAccessToken");
const {isAdmin} = require("../middleware/isAdmin");
const User=require("../models/user");


// Get all users
router.get("/",authenticateAccessToken,isAdmin, async (req,res)=>{
    /*Pagination*/ 
    const pages= parseInt(req.query.page) || 1;
    const userItem_count= parseInt(req.query.item_count) || 10;
    const skip=(pages-1)*userItem_count;
    const totalItems=await User.countDocuments();
    const totalPages=Math.ceil(totalItems/userItem_count);

    try{
        const users= await User.find().skip(skip).limit(userItem_count);
        res.json({users,pages,totalPages});
    }catch(err){
        res.status(500).json({message:err.message});
    }
});


// Get user by ID
router.get("/user/:id", authenticateAccessToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new user
router.post("/userCreate",authenticateAccessToken,isAdmin, async (req,res)=>{
    try{

        const {firstName,lastName,email,isAdmin,passwordHash}=req.body;
        const user= new User({firstName,lastName,email,isAdmin,passwordHash});
        const newUser = await user.save();
        res.status(201).json(newUser);
    }catch(err){
        res.status(400).json({message:err.message});
    }
});

// Update user by ID
router.put("/userPut/:id",authenticateAccessToken,isAdmin,async (req,res)=>{

    
    try {
        const passwordHash=await bcrypt.hash(password,10);
        const upUser= await User.findByIdAndUpdate(req.params.id,{
            firstName:req.body.firstName,
            lastName:req.body.lastName,
            email:req.body.email,
            passwordHash:passwordHash,
        },{new:true,runValidators:true});
        
        if(!upUser)
            return res.status(404).json({message: "User Not Found"})
        
        res.status(200).json(upUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete user by ID
router.delete("/userDelete/:id",authenticateAccessToken,isAdmin, async (req,res)=>{
    try {
        const user = User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// User Search
router.get("/search/:searchThem",authenticateAccessToken,isAdmin,async (req,res)=>{
    try{
        const searchValue=req.params.searchThem;
        const results = await User.find(
            {
                $or:[
                    {firstName:{$regex:searchValue, $options:"i"}},

                    {lastName:{$regex:searchValue, $options:"i"}},
                    
                    {email:{$regex:searchValue, $options:"i"}},
                    
                ]
    
            }
        );
        res.json(results);
    }catch(err){
        res.status(400).json({message:err.message});
    }
});

module.exports=router;