//const mongoose = require('mongoose');
const express = require('express')
const Partner = require('../models/partnersch');
const Customer = require("../models/usersch");
const Quote = require("../models/quote");
const middleware = require('../middleware');
const Ordersch = require("../models/Ordersch");
const router = express.Router();
const {createSecretToken} = require('./utils/secretToken')
const webPush = require ('web-push');
const { sendWhatsappMsg } = require('./Messaging/whatsappmsg');
// mongoose.connect('mongodb+srv://kiran333:kiran333@cluster0.h8q8rtb.mongodb.net/?retryWrites=true&w=majority')
// .then(()=>{
//     console.log('Connected to database!')
// }).catch(()=>{
//     console.log('Connection failed')
// });

router.get('/getId', middleware, async(req, res) => {
  const user = req.userid;
  res.json({id : user})
})


router.post('/partnerlogin', function (req, res) {
    async function start() {
      const cuscheck = await Partner.find({phone :  req.body.phone});
      let id = "";
      if(cuscheck.length ===0 ){
        const createdUser = new Partner({
          name: req.body.name,
          emailId: req.body.email,
          phone : req.body.number,
		  address : req.body.address,
          rating : req.body.rating,
          percentage : req.body.percentage,
          quotes : [],
          endpoint : {},
        });
        const result = await createdUser.save();
        console.log(result["_id"]);
        id = result['_id'];
		const token = createSecretToken(createdUser._id);
		res.status(200).json({token, message: 'GadsetPartner', id : id})
      }
      else{
        id = cuscheck[0]['_id'];
		res.json({ id: id});
      }
      
    }
    start();
  }) ;


router.get('/checkpartner', function (req, res){
	async function start(){
		console.log(req.query.phone);
		const result = await Partner.find({phone : req.query.phone});
		var id = '';
		if(result[0]) { id = result[0]._id ;
		const token = createSecretToken(id);
    	res.cookie("token", token, {
     		withCredentials: true,
      		httpOnly: false,
    	});
		res.status(200).json({token : token, message: 'GadsetPartner', id : id})}
		
		else {
			res.json({message : "no user found"});
		}
		
	}

	start();
});
// const createPartner = async(req,res,next)=>{
//     const createdPartner = new Partner({
//         name: req.body.name,
//         emailId: req.body.emailId,
//         password:req.body.password,
//         image:req.body.image,
//     });
//     const result = await createdPartner.save();
//     res.json(result);
// };

router.post("/submitquote",middleware, function (req, res) {
  async function start() {
    const partnerdata = await Partner.find({ _id: req.userid });
    if (partnerdata[0] && partnerdata[0].quotes && partnerdata[0].quotes.includes(req.body.id)) {
      return res.status(400).json({ message: "You already bidded to the quote" });
    }
    
    const partnerupdate = await Partner.updateOne({ _id: req.userid } ,
      { $push: { quotes: req.body.id  } }
    );
    console.log(partnerupdate);
    const data = {
      amount: req.body.qualities,
      partnerid: req.userid,
      rating: partnerdata?.[0]?.rating || 0,
      percentage: partnerdata?.[0]?.percentage || 0,
      warranty: req.body.warranty,
      service: req.body.service,
    };
    const res1 = await Quote.find({ _id: req.body.id })
    let message = "";
	console.log(res1);
    if(res1['activestate']===false){
      message = "Sorry, time for bid is closed";
    }
    else{
      const result = await Quote.updateOne(
        { _id: req.body.id },
        { $push: { quotesbypartner: data } }
      );
      const customer = await Customer.find({_id : res1[0].customerid});
	  console.log("customer", customer);
	  sendWhatsappMsg({
		templateParams : [`${res1[0].device}`, `${res1[0].model}`],
		destination : `+91${customer[0].phone}`,
		campaignName : 'Partner added bid - Customer Notification'
	  })
	  const payload = JSON.stringify({
        title: 'Quote updated!',
        body: 'Partner submitted a quote',
      })
	  console.log(customer[0].endpoint);
	  
    //   webPush.sendNotification(customer[0].endpoint, payload)
        // .then(result => console.log(result))
        // .catch(e => console.log(e))

      message = "successfully submited quote";
    }
    res.status(200).json({ message: message });
  }
  start();
});


router.get("/getpartnerdata",middleware, async function (req,res){
  const partnerid = req.userid;
  
  try {
    const partner = await Partner.findOne({ _id: partnerid }); 
    const allbids = await Quote.find({});
    const allorders = partner['orders'];
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    var all = 0;
    var missed = 0;
    var confirmed = await Ordersch.find({partnerid : partnerid , status : 'no', delivery : 'false'}).count() ;
    var repairing= await Ordersch.find({partnerid : partnerid , status : 'repairing', delivery : 'false'}).count() ;
    var ordercompleted= await Ordersch.find({partnerid : partnerid , status : 'done', delivery : 'false'}).count() ;
    var delivered=await Ordersch.find({partnerid : partnerid , status : 'done', delivery : 'true'}).count() ;
    var awaiting =0;

    allbids.forEach((bid) => {
      if (bid.activestate === true && bid.expirestate === false) {
        if (!partner.quotes.includes(bid._id.toString())) { 
          all=all+1;
        }
        
      }
    //   if(bid.activestate===true){
    //     if (partner.quotes.includes(bid._id.toString())) { 
    //       awaiting++;
    //     }
    //   }
    //   if (bid.activestate === false && bid.expirestate === false) { 
    //     if (!partner.quotes.includes(bid._id.toString())) { 
    //       missed=missed+1;
    //     }
    //   }        
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

router.get('/getprofile',middleware, async(req, res) => {
  const partnerId = req.userid;
  const partner = await Partner.findOne({_id : partnerId});

  if (partner) {
    res.json({partner});
  } else {
    res.status(404).json({ message: 'Partner not found' });
  }
});

router.put('/updateDetails',middleware, async (req, res) => {
  const partnerId = req.userid;
  const updatedDetails = req.body;

  const data = await Partner.updateOne({_id : partnerId}, {$set : { name : updatedDetails?.name, 
emailId :  updatedDetails?.email, address : updatedDetails?.address}, 
                            });

  if (data) {
    res.json({ message: 'Partner details updated successfully' });
  } else {
    res.status(404).json({ message: 'Partner not found' });
  }
});


module.exports = router 
//exports.createPartner = createPartner;