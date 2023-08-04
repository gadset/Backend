const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const customerSchema = new Schema({
    name : { type: String, required: true},
    emailId : { type: String, required: true, unique: true},
    password : { type: String, required: true, minlength: 6},
    image : { type: String, required: true}
});

customerSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Customer',customerSchema)
//until now we created mongoose schema and corresponding model