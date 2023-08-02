const functions = require("firebase-functions");

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//

const express = require('express'); // Importing express module
  
const app = express(); // Creating an express object
  
const port = 8002; 
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


app.use("/", require("./routes/phones"));
//app.use("/", require("./routes/payment"));
  
// Starting server using listen function
app.listen(port, function (err) {
   if(err){
       console.log("Error while starting server");
   }
   else{
       console.log("Server has been started at "+port);
   }
});

exports.app = functions.https.onRequest(app);

// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
