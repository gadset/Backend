//const mongoose = require('mongoose');
const express = require("express");
const Customer = require("../models/usersch");
const Quote = require("../models/quote");
const router = express.Router();
const Partner = require("../models/partnersch");
const QuotesSche = require('../models/Ordersch');
const webPush = require ('web-push');
const Ordersch = require("../models/Ordersch");
const publicVapidKey = 'BMQOKdrpuYRNgI3wXtDoQstTJEt1rnO9w6b9KM3MnJek8V4DH72OYNYoACbpveEVg_1snYmI8EZIdJV_5qjfMo4';
const privateVapidKey = '8xw5QAlfRzN9TcZdUK2rI6zUx5AwBXMC0PbVPngST0E';

//setting vapid keys details
webPush.setVapidDetails('mailto:patnala.1@iitj.ac.in', publicVapidKey,privateVapidKey);
// mongoose.connect('mongodb+srv://kiran333:kiran333@cluster0.h8q8rtb.mongodb.net/?retryWrites=true&w=majority')
// .then(()=>{
//     console.log('Connected to database!')
// }).catch(()=>{
//     console.log('Connection failed')
// });

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
      console.log(result["_id"]);
      id = result['_id'];
    }
    else{
      id = cuscheck[0]['_id'];
    }
    res.json({ id: id});
  }
  start();
});

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

router.post("/sendquote", function (req, res) {
  async function start() {
    const Createquote = new Quote({
      issu: req.body.issue,
      model: req.body.model,
      device: req.body.device,
      activestate:true,
      expirestate:false,
      quality: req.body.quality,
      warranty: req.body.warranty,
      service: req.body.service,
      customerid: req.body.customerid,
      quotesbypartner: [],
    });
    const result = await Createquote.save();
    console.log("/sendquotedone");
    // const timerid = setTimeout(async() => {
    //   console.log("active state changed");
    //    await Quote.updateOne(
    //     { _id: result["_id"] },
    //     { $set: { activestate: true } }
    //   );
    // }, 60000);\
    const payload = JSON.stringify({
      title: 'New quote',
      body: 'Consumer added Quoted a quote',
    })
    res.json({ id: result["_id"], message: "created the quote" });
    const partners = await Partner.find();
    console.log(partners);
    partners.forEach(async (data)=> {
      webPush.sendNotification(data.endpoint, payload)
        .then(result => console.log(result))
        .catch(e => console.log(e.stack))
    })
  }
  start();
});


router.post("/submitquote", function (req, res) {
  async function start() {
    console.log(req.body);
    const partnerdata = await Partner.find({ _id: req.body.partnerid });
    console.log(partnerdata[0])
    if (partnerdata[0] && partnerdata[0].quotes && partnerdata[0].quotes.includes(req.body.id)) {
      return res.status(400).json({ message: "You already bided to the quote" });
    }
    
    const partnerupdate = await Partner.updateOne({ _id: req.body.partnerid } ,
      { $push: { quotes: req.body.id  } }
    );
    console.log(partnerupdate);
    const data = {
      amount: req.body.amount,
      partnerid: req.body.partnerid,
      rating: partnerdata[0]["rating"],
      percentage: partnerdata[0]["percentage"],
      warranty: req.body.warranty,
      service: req.body.service,
    };
    const res1 = await Quote.find({ _id: req.body.id })
    let message = "";
    if(res1['activestate']===false){
      message = "Sorry, time for bid is closed";
    }
    else{
      const result = await Quote.updateOne(
        { _id: req.body.id },
        { $push: { quotesbypartner: data } }
      );
      console.log(result);
      message = "successfully submited quote";
    }
    res.status(200).json({ message: message });
  }
  start();
});

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

router.get("/getpartnerdata",async function (req,res){
  const partnerid = req.query.partnerid;
  console.log(partnerid)
  try {
    const partner = await Partner.findOne({ _id: partnerid }); 
    const allbids = await Quote.find({});
    const allorders=await Ordersch.find({})
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    console.log(allorders)
    var all = 0;
    var missed = 0;
    var confirmed=0;
    var repairing=0;
    var ordercompleted=0;
    var delivered=0;
    var awaiting =0;
    allbids.forEach((bid) => {
      if (bid.activestate === true && bid.expirestate === false) {
        if (!partner.quotes.includes(bid._id.toString())) { 
          all=all+1;
        }
        
      }
      if(bid.activestate===true){
        if (partner.quotes.includes(bid._id.toString())) { 
          awaiting++;
        }
      }
      if (bid.activestate === false && bid.expirestate === false) { 
        if (!partner.quotes.includes(bid._id.toString())) { 
          missed=missed+1;
        }
      }
      if( bid.activestate===false){
            if(partner.quotes.includes(bid._id.toString())){
               allorders.forEach((order)=>{
                   if(order.partnerid===partnerid){
                    if(order.status==='no' && order.delivery ==='false'){
                        confirmed=confirmed+1 
                    }
                    if(order.status==='repairing' && order.delivery ==='false'){
                      repairing=repairing+1 
                    }
                    if(order.status==='done' && order.delivery ==='false'){
                      ordercompleted=ordercompleted+1 
                    }
                    if(order.status==='done' && order.delivery ==='false'){
                      delivered=delivered+1 
                    }
                   }
               })
            }
      }
    });
  let newestBid = null;
  let newestTimestamp = 0;

  allbids.forEach((bid) => {
    if (bid.activestate === true && bid.expirestate === false) {
      const bidTimestamp = new Date(bid.createdAt).getTime();
      if (!partner.quotes.includes(bid._id.toString())) {
        if (bidTimestamp > newestTimestamp) {
          newestTimestamp = bidTimestamp;
          newestBid = bid;
        }
      }
    }
  });
  console.log(newestBid);
    return res.status(200).json({ all, missed,confirmed,awaiting,repairing,ordercompleted,delivered,newestBid});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } 
   
})

router.get("/getbids", async function(req, res) {
  try {
    const allbids = await Quote.find();

    res.status(200).json({ allbids });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching bids" });
  }
});

// router.get("/getquotes", function (req, res) {
//   async function start() {
//     const partnerid = req.query.id;
//     const partnerdata = await Partner.find({_id : partnerid});
//     const objects = await Quote.find({ _id : {$nin : partnerdata[0]['quotes']}});
//     for await (const doc of objects) {
//       console.log(doc);
//     }
//     res.json({ objects: objects });
//   }
//   start();
// });

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
    expirationTime: null,
    keys: {
      p256dh: req.query.pdh,
      auth: req.query.auth
    }
  }
  const documentId = req.query.id; 
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  let obj = [];
  const sendLatestData = async() => {
    const objects = await Quote.find({ _id: documentId});
    console.log(objects[0]);
    let data = [] ;
    if(objects[0]) {data = objects[0]["quotesbypartner"];}
    console.log(obj);
    console.log(data);
    if(!compareTwoArrayOfObjects(obj, data)){
      const payload = JSON.stringify({
        title: 'Quote updated!',
        body: 'Partner Quoted a quote',
      })
      webPush.sendNotification(subscription, payload)
        .then(result => console.log(result))
        .catch(e => console.log(e.stack))
    
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

router.post("/getorder", function (req, res) {
  async function start() {
    const result = await Customer.find({ _id: req.body.id });
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
router.get('/pendingbids', async(req,res) => {
    try {
      const partnerId = req.query.id;
      const partnerdata = await Ordersch.find({partnerid: partnerId});
      console.log(partnerdata)
      const updata = partnerdata.filter((data) => {
        if(data['status'] === 'repairing') {
          return true;
        }
      })
      res.status(200).json(updata);

    } catch(error) {
      console.log(error);
    }
})

router.get("/getquotes",  async(req, res) => {
  try {
    const partnerId = req.query.id;
    const partnerdata = await Ordersch.find({partnerid: partnerId});
      console.log(partnerdata)
      const updata = partnerdata.filter((data) => {
        if(data['status'] === 'no') {
          return true;
        }
      })
      res.status(200).json(updata);
  } catch(error) {
    console.log(error);
  }
})

router.get("/deliveredquotes",  async(req, res) => {
  try {
    const partnerId = req.query.id;
    const partnerdata = await Ordersch.find({partnerid: partnerId});
    console.log(partnerdata)
    const updata = partnerdata.filter((data) => {
      if(data['status'] === 'done' && data['delivery']===true) {
        return true;
      }
    })
      res.status(200).json(updata);
  } catch(error) {
    console.log(error);
  }
})

router.get("/completedquotes",  async(req, res) => {
  try {
    const partnerId = req.query.id;
    const partnerdata = await Ordersch.find({partnerid: partnerId});
    console.log(partnerdata)
    const updata = partnerdata.filter((data) => {
      if(data['status'] === 'done' && data['delivery']===false) {
        return true;
      }
    })
      res.status(200).json(updata);
  } catch(error) {
    console.log(error);
  }
})



module.exports = router;

