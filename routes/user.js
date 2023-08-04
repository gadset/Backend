const mongoose = require('mongoose');

const Customer = require('../models/usersch');

mongoose.connect('mongodb+srv://kiran333:kiran333@cluster0.h8q8rtb.mongodb.net/?retryWrites=true&w=majority')
.then(()=>{
    console.log('Connected to database!')
}).catch(()=>{
    console.log('Connection failed')
});


const createUser = async(req,res,next)=>{
    const createdUser = new Customer({
        name: req.body.name,
        emailId: req.body.emailId,
        password:req.body.password,
        image:req.body.image,
    });
    const result = await createdUser.save();
    res.json(result);
};

exports.createUser = createUser;