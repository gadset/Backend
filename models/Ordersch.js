const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
	quoteid : {type : String, required : true},
    partnerid : { type: String, required: true},  //id of partner
	delivery : { type: String, required: true,},  // delivered or not
    // paymenttotal : {type : Number, required : true}, 
	// paymentdone : {type : Number, required : true},
	orderNo : {type : Number},
	amount : {type:String,},
	details : {type : Object,},
	date : {type : Object,},
    customerid : {type : String, required : true},
    device : {type : String},
	model : {type : String},
	issue : {type : Array, required : true},
	entry : {type : Object, required : true},  // will come after start reparing
	exit : {type : Object, required : true},   // will come if repairing pending so order is completed now
	deliveryform : {type : Object, required : true}, // order delivered to the customer
	status : {type : String, required : true},  // status of order (repair not started, repairing, reparing done)
	
});

OrderSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Order',OrderSchema)
//until now we created mongoose schema and corresponding model