const jwt=require('jsonwebtoken');
require("dotenv").config();

module.exports=function(req,res,next){
    try{
       let token =req.header('x-token');
       console.log(token);
       if(!token){
        return res.status(400).send('Token Not Found');
       }
       let decode=jwt.verify(token,'Gadset')
       req.userid=decode.id;
       next();
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}