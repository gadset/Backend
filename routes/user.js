//const mongoose = require('mongoose');
const express = require("express");
const Customer = require("../models/usersch");
const Quote = require("../models/quote");
const router = express.Router();
const Partner = require("../models/partnersch");
const QuotesSche = require('../models/quote');
const webPush = require ('web-push');
const Ordersch = require("../models/Ordersch");
const SubscriptionSchema = require("../models/subscriptionschema")
const publicVapidKey = 'BJs-1rAgTehzrIsAOwkqNHiwhTNB2Iudrw5XRzAen9wFcpcvICqVzpxwA7vwdyT1grGNOaKW9kdconwzjnHWWIg';
const privateVapidKey = 'yRBdMIDs9GKjHqPytBgV0jyYrrMkF_IRbNWRH9kplaI';
const jwt = require('jsonwebtoken');
const middleware = require('../middleware');
const { data } = require("cheerio/lib/api/attributes");

router.get('/u', middleware, async(req, res) => {
  const user = req.userid;
  res.json({user})
})

router.post('/getbidsfordevice' ,middleware, async(req, res) => {
  const user = req.userid;
  const deviceid = req.body.id;
  try {
    const data = await Quote.findById(deviceid);
    sendBidNotification(user);
    res.status(200).json({data})
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

async function sendBidNotification(user) {
  
  const subscription = await SubscriptionSchema.find({user : user})


  const payload = JSON.stringify({
    title: 'New Bid Arrived',
    body: 'A new bid has been placed on your auction item.',
    // bidData: bidData,
  });

  webPush.sendNotification(subscription, payload)
    .then(() => {
      console.log('Notification sent successfully');
    })
    .catch((error) => {
      console.error('Error sending notification:', error);
    });
}


router.post("/", function (req, res) {
  async function start() {
    const cuscheck = await Customer.find({phone :  req.body.phone});
    let id = "";
    if(cuscheck.length ===0 ){
      const createdUser = new Customer({
        name: req.body.name,
        // emailId: "",
        //image:req.body.image,
        address: {},
        phone: req.body.phone,
        orders : [],
      });
      const result = await createdUser.save();
      // console.log(result["_id"]);
      id = result['_id'];
    }
    else{
      id = cuscheck[0]['_id'];
    }
    res.json({ id: id});
  }
  start();
});


router.post('/loginCheck', async(req, res)=> {
    try {
      const phone = req.body.number;
      // console.log(phone);
      const user = await Customer.findOne({phone: phone});
      // console.log(user);
      if(!user) {
        const newCustomer = new Customer({ phone: phone });
        await newCustomer.save();
        const token = jwt.sign({ id: newCustomer._id },'Gadset',{expiresIn:36000000},(err,token)=>{
          if(err) throw err;}	);
		 return res.status(200).json({message : 'new user', token : token})
      } else {
        const token = jwt.sign({ id: user._id },'Gadset',{expiresIn:36000000},(err,token)=>{
            if(err) throw err;
            else{
            return res.status(200).json({message : '', token : token})
		}
        });

		//  return res.status(200).json({message : 'customer identified successfully'})
      }

    } catch(error) {
      res.json({'message': error})
    }
})

router.post('/addname',middleware, async(req,res) => {
    const {name} = req.body;
    console.log(name);
    try {
      const UpdatedUser = await Customer.findByIdAndUpdate(
        req.userid,
        {name: name},
        {new: true}
      )
      if(UpdatedUser) {
        console.log(UpdatedUser);
        res.status(200).json({UpdatedUser});
      }
      else {
        res.status(200).json({message: 'user not found'})
      }
    } catch(error) {
      res.json({error})
    }
})

router.get('/profile', middleware, async(req, res) => {
  try{
    const user = await Customer.findOne({_id : req.userid});
    console.log(req.userid)
    if(user) {
      console.log(user);
      res.status(200).json({user})
    } else {
      res.json({message: 'No user found'})
    }
  } catch(err) {
    res.status(400).json({err})
  }
})

router.post("/setaddress", function (req, res) {
  async function start() {
    const result = await Customer.updateOne(
      { _id: req.body.id },
      { $set: { address: req.body.address } }
    );
    console.log(result);
    res.json({ message: "Address updated" });
  }
  start();
});




router.post('/sendquote', middleware, async(req, res) => {
  try {
    const Createquote = new Quote({
      issu: req.body.issue,
      model: req.body.model,
      device: req.body.device,
      activestate:true,
      expirestate:false,
      quality: req.body.quality,
      warranty: req.body.warranty,
      service: req.body.service,
      customerid: req.userid,
      quotesbypartner: [],
    });
    console.log(Createquote);
    await Createquote.save();
    res.status(200).json({id : Createquote._id, message: 'Created the Quote'});
	
  } catch(err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})


router.get("/getallbids", async function(req, res) {
  try {
    const partnerid = req.query.partnerid;
    console.log(partnerid);
    const allbids = await Quote.find({ activestate: true, expirestate: false });
    const partner = await Partner.findOne({ _id: partnerid });
    const filteredBids = allbids.filter((bid) => {
      return !partner.quotes.includes(bid._id.toString());
    });
    res.status(200).json({ allbids: filteredBids });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching bids" });
  }
});

router.get("/getbids", async function(req, res) {
  try {
    const allbids = await Quote.find();

    res.status(200).json({ allbids });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching bids" });
  }
});
router.get("/getquotes",middleware, function (req, res) {
// console.log("userid is there", req.userid);
  async function start() {
    const partnerid = req.userid;
    const partnerdata = await Partner.find({_id : partnerid});
    const objects = await Quote.find({ _id : {$nin : partnerdata[0]['quotes']}});
    res.json({ objects: objects });
  }
  start();
});

const SEND_INTERVAL = 5000;

let compareTwoArrayOfObjects = (
  first_array_of_objects,
  second_array_of_objects
) => {
  return (
      first_array_of_objects.length === second_array_of_objects.length &&
      first_array_of_objects.every((element_1) =>
          second_array_of_objects.some((element_2) =>
              Object.keys(element_1).every((key) => element_1[key] === element_2[key])
          )
      )
  );
};



router.get('/quotesdashboard', (req, res) => {
  const subscription ={
     endpoint: req.query.endpoint,
	// endpoint : "https://fcm.googleapis.com/fcm/send/cBrRXPlbpSs:APA91bFAp-nKI0tEZPjR-0nEKvCfOzdU7P-kKPFS6TKwqFjkLjQbhhNhI9S9W7KvMIXbbciMkcYwkXxzx-gXF1bOJDv5srewYZttxEhsKmv8PohbwD65UZx2KRz-NHvYjHkCUiFaurBx",
    expirationTime: null,
    keys: {
      p256dh: req.query.pdh,
	// p256dh : "BJgu00RJuRbjjZyJympTMfgNGBsnqY28dtg7YH1tVDN1hmotnGpdYjBzCb-rgiJkwBDO2zAvSRlhYF4Jpks988E",
   auth: req.query.auth
	// auth : "LQRx34kcreRalLW_CZDSpQ"

    }
  }

res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const documentId = req.query.id; 

console.log("documentId", documentId);
  let obj = [];
  const sendLatestData = async() => {
    const objects = await Quote.find({ _id: documentId});
    let data = [] ;
    if(objects[0]) {data = objects[0]["quotesbypartner"];}
    if(!compareTwoArrayOfObjects(obj, data)){
      const payload = JSON.stringify({
        title: 'Quote updated!',
        body: 'Partner submiited a quote',
      })
	  console.log("endpoint", req.query.endpoint);
      webPush.sendNotification(subscription, payload)
        .then(result => console.log(result))
        .catch(e => console.log(e))
    
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      obj = data;
    } 
  };

  sendLatestData();
  const interval = setInterval(sendLatestData, 5000);

  req.on('close', () => {
    clearInterval(interval);
    console.log('Client disconnected');
  });
});


router.post("/getquotesbyid", function (req, res) {
  async function start() {
    console.log("started here");
    console.log(req.body.quoteid);
    const objects = await Quote.find({ _id: req.body.quoteid });
    console.log(objects[0]);
    let data = [] 
    if(objects[0]) { data = objects[0]["quotesbypartner"]}
    res.json({ objects: data });
  }
  start();
});

router.post("/saveorder", function (req, res) {
  async function start() {
	let data = req.body.orderdata ; 
    const result = await Customer.updateOne(
      { _id: req.body.id },
      { $push: { orders: req.body.orderdata } }
    );
    console.log(result);
    res.json({ message: "Check orders page" });
  }

  start();
});

router.post("/getuser", function (req, res) {
  async function start(){
    const result = await Customer.find({ _id: req.body.id });
    let data= {}
    if(result[0]) {data = result[0];}
    res.json({ data: data, message: "orders fetched successful" });
  }
  start();
 })

router.post("/getorder",middleware, function (req, res) {
  async function start() {
    const result = await Customer.find({ _id: req.userid });
    console.log(result);
    let data = [];
    if(result[0]) { 
      let ndata = result[0]['orders'] 
      for(let i=0; i<ndata.length ; i++){
        const par = await Partner.find({ _id: ndata[0].partnerid});
        const qu = await Quote.find({_id : ndata[0].quoteid});
        let d = {
          name : par[0]["name"],
          email : par[0]["emailId"],
          address : par[0]["address"],
          phone : par[0]['phone'],
          amount : ndata[i]['amount'],
          warranty : ndata[i]['warranty'],
          service : ndata[i]['service'],
          model : qu[0]['model'],
          device : qu[0]['device'],
          date : ndata[i]['date'],
          issues : qu[0]['issu'],
          payment : ndata[i]['payment'],
        }
        data.push(d);
      }
    }
    res.json({ data: data, message: "orders fetched successful" });
  }
  start();
});


router.get('/missedbids', async(req,res) => {
  try{
    const Quotes = await Quote.find({});
    const partnerid = req.query.partnerid;
    console.log(partnerid);
    const partner=await Partner.findOne({_id:partnerid})
    const data = [];
    Quotes.forEach((quote) => {
      if(quote.activestate === false && quote.expirestate===false) {
        if(!partner.quotes.includes(quote._id.toString())){
          data.push(quote);
        }
      }
    })
    console.log(data);
    res.status(200).json(data);
  }
  catch(err){
     return res.status(400).json({"message":'Internal Server Error'})
  }
   
})

router.get('/awaitingbids', async(req,res) => {
  try{
    const Quotes = await Quote.find({});
    const partnerid = req.query.partnerid;
    // console.log(partnerid);
    const partner=await Partner.findOne({_id:partnerid})
    const data = [];
    Quotes.forEach((quote) => {
      if(quote.activestate === true && quote.expirestate===false) {
        if(partner.quotes.includes(quote._id.toString())){
          quote.quotesbypartner.forEach((quotebid)=>{
            if(quotebid.partnerid === partnerid){
              quote = { ...quote };
              quote._doc.bid=quotebid.amount
              data.push(quote._doc);
            }
          })
        }
      }
    })
    // console.log(data);
    res.status(200).json(data);
  }
  catch(err){
     return res.status(400).json({"message":'Internal Server Error'})
  }
})
// router.get("/getquotes",middleware,  async(req, res) => {
//   try {
//     const partnerId = req.userid;
//     const partnerdata = await Ordersch.find({partnerid: partnerId});
//       const updata = partnerdata.filter((data) => {
//         if(data['status'] === 'no') {
//           return true;
//         }
//       })
//       res.status(200).json(updata);
//   } catch(error) {
//     console.log(error);
//   }
// })


router.get("/getallbids", async function(req, res) {
  try {
	const partnerid = req.query.id;
    const partnerdata = await Partner.find({_id : partnerid});
	// 
    const allbids = await Quote.find({ activestate: 'true',  _id : {$nin : partnerdata?.[0]?.['quotes'] || ''} });

    res.status(200).json({ allbids });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching bids" });
  }
});


router.get("/getbids", async function(req, res) {
  try {
    const allbids = await Quote.find();

    res.status(200).json({ allbids });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching bids" });
  }
});

router.get('/getquotesdata', middleware, async(req, res) => {
  console.log('entered')
  const user = req.userid;
  console.log(user);
  try {
      const data = await Quote.find({ customerid: user });
      console.log(data);
      res.status(200).json(data); 
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
})

router.get('/bidstodisplay', async(req, res) => {

  try {
    const data = await Quote.find({}).sort({_id: -1}).limit(10);
    res.status(200).json({data});
  } catch(err) {
    console.log(err);
    res.json({err})
  }
})



module.exports = router;

