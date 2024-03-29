const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const partnerSchema = new Schema({
    name : { type: String, required: true},
    emailId : { type: String, required: true,},
    phone : {type : Number, required : true,unique : true },
    address : {type : Object, required : true},
    rating : {type : Number},
    percentage : {type : Number},
    quotes : {type :Array},
    endpoint : {type : Object},
	orders : {type : Array},
});

partnerSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Partner',partnerSchema)
//until now we created mongoose schema and corresponding model