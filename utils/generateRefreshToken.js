const jwt=require("jsonwebtoken");

const generateRefreshToken=(user)=>{
    return jwt.sign(
        {email:user.email,id:user.id},
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:"1m",
        }
    );
};

module.exports=generateRefreshToken;