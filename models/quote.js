const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    issu:{type:Array, required:true},
    model:{type:String,required:true},
    device : {type :String, required : true},
    activestate:{type:Boolean, default:true, required:true},
    expirestate:{type:Boolean, default:false, required:true},
    quality:{type:String, required:true},
    warranty:{type:String, required:true},
    service:{type:String, required:true},
    customerid : {type : String},
    quotesbypartner : {type : Array},
});

module.exports = mongoose.model('Quote',quoteSchema);

