const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    issu:{type:String, required:true},
    model:{type:String,required:true},
    activestate:{type:Boolean, default:true},
    quality:{type:String, required:true},
    warranty:{type:String, required:true},
    service:{type:String, required:true},
});

module.exports = mongoose.model('Quote',quoteSchema);

