const fs = require('firebase-admin');
const serviceAccount = require("./gadset-customer-cc57a21e1ae9.json");
fs.initializeApp({
 credential: fs.credential.cert(serviceAccount)
});
 const db = fs.firestore();

 module.exports = db;