var nodemailer = require('nodemailer');

const sendMail = ({tomail, subject, details}) => {
	var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'patnala.1@alumni.iitj.ac.in',
    pass: 'swzdwsqxvniwywhe'
  }
});
var mailOptions = {
  from: 'patnala.1@alumni.iitj.ac.in',
  to: tomail,
  subject: subject,
  text: details
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

}

module.exports =  {sendMail};
