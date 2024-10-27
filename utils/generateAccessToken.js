const jwt=require("jsonwebtoken");

const generateAccessToken=(user)=>{
    return jwt.sign(
        {email:user.email,id:user.id},
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:"3m",
        }
    );
};

module.exports=generateAccessToken;