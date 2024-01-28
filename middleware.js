const jwt=require('jsonwebtoken');
require("dotenv").config();
const createError = require('http-errors');
module.exports=function(req,res,next){
    try{
       let token =req.header('x-token');
	//    console.log("header", req.header('x-token'));
       if(!token){
		// const error = new createError(401,"Token not found")
		// return next(error);
        return res.status(400).send('Token Not Found');
       }
       let decode=jwt.verify(token,'Gadset')
       req.userid = decode.id;
       next();
    }
    catch(err){
        console.log(err);
		// const eror = new HttpError("Authentication failed", 401);
		// return next(eror);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

