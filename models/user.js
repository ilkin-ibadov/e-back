const mongoose= require('mongoose');

const userSchema= new mongoose.Schema({
    firstName: {type:String,required:true},
    lastName: {type:String,required:true},
    email: {type:String,required:true,unique:true},
    passwordHash: {type:String,required:true},
    basket:[{type:mongoose.Schema.Types.ObjectId, ref:"Product", default:[]}],
    orders:[{type:mongoose.Schema.Types.ObjectId,ref:"Order", default:[] }],
    isAdmin:{type: Boolean, default:false}
},{timestamps:true});

const User= mongoose.model("User", userSchema);

module.exports=User;