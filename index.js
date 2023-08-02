//const functions = require("firebase-functions");
const express = require('express'); // Importing express module
  
const app = express(); // Creating an express object
  
const port = 8003; 
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions)) 
 // Setting an port for this application
const catalog = require('./src/catalog');
const deals = require('./src/deals');
const glossary = require('./src/glossary');
const search = require('./src/search');
const top = require('./src/top');

app.use(express.json({ extended: false }));

app.use("/", require("./routes/phones.js"));
app.use("/", require("./routes/payment.js"));
app.use("/message", require("./routes/sendmessage"));
  
// Starting server using listen function
app.listen(port, function (err) {
   if(err){
       console.log("Error while starting server");
   }
   else{
       console.log("Server has been started at "+port);
   }
});

//exports.app = functions.https.onRequest(app);