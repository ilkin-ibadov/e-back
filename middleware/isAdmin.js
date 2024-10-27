const User = require('../models/user');

const isAdmin = async (req,res,next)=>{
    try{
        const user = await User.findById(req.user);

        if(!user) return res.sendStatus(404); 

        if(!user.isAdmin) return res.sendStatus(403); 

        next();
    }catch(err){
        res.sendStatus(500);
    }
}

module.exports={isAdmin};