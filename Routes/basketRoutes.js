const express=require("express");
const router=express.Router();
const {authenticateAccessToken}=require("../middleware/authenticateAccessToken");
const {isAdmin}=require("../middleware/isAdmin");

const User=require("../models/user");


// Get basket all
router.get("/",authenticateAccessToken, async (req,res)=>{
    try{
        const data= await User.findById(req.user).populate("basket");
        if (!data) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(data.basket);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});



// Add product to basket
router.post('/basketCreate/:productId', authenticateAccessToken, isAdmin, async (req, res) => {
    try {
        await User.updateOne(
            {_id:req.user},
            {$addToSet:{basket:req.params.productId}}
        );

        res.status(201).json("Product added");
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});




router.post("/basketDelete/:id",authenticateAccessToken, async (req,res)=>{
    try {
        await User.updateOne(
            {_id:req.user},
            {$pull:{basket:req.params.id}}
        );
        res.json({ message: "Item removed from basket" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



module.exports=router;