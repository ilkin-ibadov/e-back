const express=require("express");
const router=express.Router();
const {authenticateAccessToken}=require("../middleware/authenticateAccessToken");
const {isAdmin} = require("../middleware/isAdmin");
const Order=require("../models/orderItem");
const Products=require("../models/product");

// Get all orders 
router.get("/",authenticateAccessToken, async (req,res)=>{
    /*Pagination*/ 
    const pages= parseInt(req.query.page) || 1;
    const ordertItem_count= parseInt(req.query.item_count) || 10;
    const skip=(pages-1)*ordertItem_count;
    const totalItems=await Products.countDocuments();
    const totalPages=Math.ceil(totalItems/ordertItem_count);
    try{
        const orders= await Order.find({owner:req.user}).skip(skip).limit(ordertItem_count).populate("products");
        res.json({orders,pages,totalPages});
    }catch(err){
        res.status(500).json({message:err.message});
    }
});

// Get a specific order by ID
router.get("/order/:id",authenticateAccessToken,isAdmin,async (req,res)=>{
    try{
        const order= await Order.findById(req.params.id)
            .populate("products")
            .populate("owner","userName email");
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        } 
        res.json(order);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});


// Create a new order
router.post('/orderCreate', authenticateAccessToken, async (req, res) => {
    try {
        const { products } = req.body;
        let totalPrice = 0;
        for (let item of products) {
            const product = await Products.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            totalPrice += product.price * item.quantity;
        }

        const order = new Order({
            owner: req.user,
            products,
            totalPrice,
        });

        const newOrder = await order.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Update an order by ID
router.put('/orderPut/:id', authenticateAccessToken, isAdmin, async (req, res) => {
    try {
        const { products } = req.body;
        
        let totalPrice = 0;
        for (let item of products) {
            const product = await Products.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            totalPrice += product.price * item.quantity;
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            {
                products,
                totalPrice,
            },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(updatedOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Delete an order by ID
router.delete("/orderDelete/:id",authenticateAccessToken,isAdmin, async (req,res)=>{
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: "Order deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



module.exports=router;