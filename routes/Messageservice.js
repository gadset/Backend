var twilio = require('twilio');
require('dotenv').config();
const accountSid = "AC5e5d731a944b6272ac696c3edab8c308"; //Your Account SID from twilio console
const authToken ="cf29c1473c8918d153afe631f07887b4"; //Your Auth Token from twilio console

var client = new twilio(accountSid, authToken);

module.exports = {
    sendSms: async(req, callback) => {
        const phoneNumber = req.to; // phone number must start with country code
        client.messages.create({
            body: req.message,
            to: phoneNumber, //'',  // Text this number
            from: '+12178820690' // From a valid Twilio number
        }, function(err, message) {
            if (err) {
                callback(err.message);
            } else {
                callback(null, message.sid);
            }
        });
    },

}