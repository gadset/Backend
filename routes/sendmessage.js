
const express = require('express')
const router = express.Router();
const Twilio = require("./Messageservice.js");

router.post('/', function (req, res) {
    const phoneNumber = req.body.phone;
    console.log(phoneNumber)
    Twilio.sendSms({ to: phoneNumber, 
    message: `you got a notification from twilio` }, 
    (err,smsData) => {
     res.send(smsData);
});

  res.send({"message" : "sms sent"})
    
  });


  module.exports = router ;