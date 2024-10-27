const mongoose= require("mongoose");

const orderSchema= new mongoose.Schema({

    products:[
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, "Quantity cannot be less than 1"]
            }
        }
    ],

    owner:{type:mongoose.Schema.Types.ObjectId,ref:"User",required: true},

    totalPrice: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["Pending", "Processed", "Shipped", "Delivered", "Cancelled"],
        default: "Pending",
        required: true
    },
    
    orderDate: {
        type: Date,
        default: Date.now
    },
});

const Order= mongoose.model("Order", orderSchema);

module.exports = Order;