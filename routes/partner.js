//const mongoose = require('mongoose');
const express = require('express')
const Partner = require('../models/partnersch');
const Quote = require("../models/quote");
const middleware = require('../middleware');
const router = express.Router();
const {createSecretToken} = require('./utils/secretToken')
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
          address : req.body.address,
          phone : req.body.number,
          rating : req.body.rating,
          percentage : req.body.percentage,
          quotes : [],
          endpoint : {},
        });
        const result = await createdUser.save();
        console.log(result["_id"]);
        id = result['_id'];
		const token = createSecretToken(createdUser._id);
    	res.cookie("token", token, {
     		withCredentials: true,
      		httpOnly: false,
    	});
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

router.post("/submitquote", function (req, res) {
  async function start() {
    const partnerdata = await Partner.find({ _id: req.body.partnerid });
    if (partnerdata[0] && partnerdata[0].quotes && partnerdata[0].quotes.includes(req.body.id)) {
      return res.status(400).json({ message: "You already bidded to the quote" });
    }
    
    const partnerupdate = await Partner.updateOne({ _id: req.body.partnerid } ,
      { $push: { quotes: req.body.id  } }
    );
    console.log(partnerupdate);
    const data = {
      amount: req.body.amount,
      partnerid: req.body.partnerid,
      rating: partnerdata?.[0]?.rating || 0,
      percentage: partnerdata?.[0]?.percentage || 0,
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
    allorders.forEach(async (orderid)=>{
		const order = await Ordersch.find({_id : orderid})
            if(order.status==='no' && order.delivery ==='false'){
                     confirmed=confirmed+1 
            }
            if(order.status==='repairing' && order.delivery ==='false'){
                      repairing=repairing+1 
            }
        	if(order.status==='done' && order.delivery ==='false'){
                      ordercompleted=ordercompleted+1 
            }
            if(order.status==='done' && order.delivery ==='true'){
                      delivered=delivered+1 
            }
        })
            
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



module.exports = router 
//exports.createPartner = createPartner;