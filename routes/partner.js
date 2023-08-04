const mongoose = require('mongoose');

const Partner = require('../models/partnersch');

mongoose.connect('mongodb+srv://kiran333:kiran333@cluster0.h8q8rtb.mongodb.net/?retryWrites=true&w=majority')
.then(()=>{
    console.log('Connected to database!')
}).catch(()=>{
    console.log('Connection failed')
});


const createPartner = async(req,res,next)=>{
    const createdPartner = new Partner({
        name: req.body.name,
        emailId: req.body.emailId,
        password:req.body.password,
        image:req.body.image,
    });
    const result = await createdPartner.save();
    res.json(result);
};

exports.createPartner = createPartner;