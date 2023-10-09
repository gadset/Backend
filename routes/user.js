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
const jwt = require('jsonwebtoken');
const middleware = require('../middleware');
const { data } = require("cheerio/lib/api/attributes");

//setting vapid keys details
webPush.setVapidDetails('mailto:patnala.1@iitj.ac.in', publicVapidKey,privateVapidKey);


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


router.post('/loginCheck', async(req, res)=> {
    try {
      const phone = req.body.number;
      console.log(phone);
      const user = await Customer.findOne({phone: phone});
      console.log(user);
      if(!user) {
        const newCustomer = new Customer({ phone: phone });
        await newCustomer.save();
        const token = jwt.sign({ id: newCustomer._id },'Gadset',{expiresIn:36000000},(err,token)=>{
          if(err) throw err;
          else{
          return res.status(200).json({token, message: 'new user'})}
          console.log(newCustomer)
      });
      } else {
        const token = jwt.sign({ id: user._id },'Gadset',{expiresIn:36000000},(err,token)=>{
            if(err) throw err;
            else{
            return res.status(200).json({token})}
        });
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
  console.log('Entered')
  try {
    const Createquote = new Quote({
      issu: req.body.issue,
      model: req.body.model,
      device: req.body.device,
      activestate: true,
      quality: req.body.quality,
      warranty: req.body.warranty,
      service: req.body.service,
      customerid: req.userid,
      quotesbypartner: [],
    });
    console.log(Createquote);
    await Createquote.save();
    res.status(200).json({Createquote, message: 'Created the Quote'})
    
  } catch(err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

router.post("/submitquote", function (req, res) {
  async function start() {
    console.log(req.body.partnerid);
    const partnerdata = await Partner.find({ _id: req.body.partnerid });
    const partnerupdate = await Partner.updateOne({ _id: req.body.partnerid } ,
      { $push: { quotes: req.body.id  } }
    );

    console.log(partnerdata);
    const data = {
      amount: req.body.amount,
      partnerid: req.body.partnerid,
      rating: partnerdata[0]["rating"],
      percentage: partnerdata[0]["percentage"],
      warranty: req.body.warranty,
      service: req.body.delivery,
    };
    const res1 = await Quote.find({ _id: req.body.id })
    let message = "";
    if(res1['activestate']===true){
      message = "Sorry, time for bid is closed";
    }
    else{
      const result = await Quote.updateOne(
        { _id: req.body.id },
        { $push: { quotesbypartner: data } }
      );
      console.log(result);
      message = "successfully submited";
    }
    res.json({ message: message });
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
    const Quotes = await Quote.find();
    const data = [];
    Quotes.forEach((quote) => {
      if(quote.activestate == false) {
        data.push(quote);
      }
    })
    console.log(data);
    res.status(200).json(data);
})


router.get('/pendingbids', async(req,res) => {
    try {
      const partnerId = req.query.id;
      const partnerdata = await Ordersch.find({partnerid: partnerId});
      const value = [];
      console.log(partnerdata)
      const updata = await partnerdata.forEach((data) => {
        if(data['status'] == 'repairing' && data['delivery']== 'false') {
          value.push(data);
        }
      })
      res.status(200).json(value);

    } catch(error) {
      console.log(error);
    }
})

router.get("/getquotes",  async(req, res) => {
  try {
    const partnerId = req.query.id;
    const partnerdata = await Ordersch.find({partnerid: partnerId});
      const value = [];
      console.log(partnerdata)
      const updata = await partnerdata.forEach((data) => {
        if(data['status'] == 'no'&& data['delivery']== 'false') {
          value.push(data);
        }
      })
      res.status(200).json(value);
  } catch(error) {
    console.log(error);
  }
})


router.get("/completedquotes",  async(req, res) => {
  try {
    const partnerId = req.query.id;
    const partnerdata = await Ordersch.find({partnerid: partnerId});
      const value = [];
      console.log('hi', partnerdata)
      const updata = await partnerdata.forEach((data) => {
        if(data['status'] == 'yes' && data['delivery']== 'false') {
          value.push(data);
        }
      })
      res.status(200).json(value);
  } catch(error) {
    console.log(error);
  }
})

router.get('/delivered', async(req,res) => {
  try {
    const partnerId = req.query.id;
    const partnerdata = await Ordersch.find({partnerid: partnerId});
      const value = [];
      const updata = await partnerdata.forEach((data) => {
        if(data['delivery'] == 'true') {
          value.push(data);
        }
      })
      console.log(value);
      res.status(200).json(value);
  } catch(error) {
    console.log(error);
  }
})

router.get("/getallbids", async function(req, res) {
  try {
    const allbids = await Quote.find({ activestate: 'true' });

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

router.post('/getbidsfordevice' ,middleware, async(req, res) => {
  console.log('Entered')
  const user = req.userid;
  const deviceid = req.body.id;
  console.log(deviceid);
  try {
    const data = await Quote.findById(deviceid);
    console.log(data);
    res.status(200).json({data})
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

module.exports = router;

