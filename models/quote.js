const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    issu:{type:Array, required:true},
    model:{type:String},
    device : {type :String, required : true},
    activestate:{type:Boolean, default:true, required:true},
    quality:{type:String, required:true},
    warranty:{type:String, required:true},
    service:{type:String, required:true},
    customerid : {type : String},
    quotesbypartner : {type : Array},
    createdAt: { type: Date, default: Date.now },
    // quotesbypartner : {type : Array},
    // createdAt: { type: Date, default: Date.now },
    expirestate: {type:Boolean, default:false, required:true},
	image : {type : String},
	description : {type : String},
});

module.exports = mongoose.model('Quote',quoteSchema);

