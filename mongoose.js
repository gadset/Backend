const mongoose = require('mongoose');

const Product = require('./models/product');

mongoose.connect('mongodb+srv://kiran333:kiran333@cluster0.h8q8rtb.mongodb.net/?retryWrites=true&w=majority')
.then(()=>{
    console.log('Connected to database!')
}).catch(()=>{
    console.log('Connection failed')
});


const createProduct = async(req,res,next)=>{
    const createdProduct = new Product({
        name: req.body.name,
        price: req.body.price
    });
    const result = await createdProduct.save();
    res.json(result);
};

exports.createProduct = createProduct;