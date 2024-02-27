const accountSid = 'AC5e5d731a944b6272ac696c3edab8c308';
const authToken = '133f3d95c0a4096cb088553a482e2417';
const client = require('twilio')(accountSid, authToken);

const sendmessage = ({details, tophone}) => {

	client.messages
.create({
      body: details,
    from: '+16592215152',
        to: tophone
 })
.then(message => console.log(message.sid)); 
}

module.exports = {sendmessage};
