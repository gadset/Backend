const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const partnerSchema = new Schema({
    name : { type: String, required: true},
    emailId : { type: String, required: true, unique: true},
    password : { type: String, required: true, minlength: 6},
    image : { type: String, required: true}
});

partnerSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Partner',partnerSchema)
//until now we created mongoose schema and corresponding model