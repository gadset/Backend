const express = require('express')
const Order = require('../models/Ordersch');
const Partner = require('../models/partnersch');
const Quote = require('../models/quote');
const Customer = require("../models/usersch");
const Subscription = require('../models/subscriptionschema');
const middleware = require('../middleware');
const webPush = require ('web-push');
const { sendWhatsappMsg } = require('./Messaging/whatsappmsg');
const { sendMail } = require('./Messaging/sendemail');
const router = express.Router();

router.get('/getorders',middleware, function(req,res){
	async function start() {
    const partnerid = req.userid;
	const status = req.query.status;
	const delivery = req.query.delivery;
    const partnerdata = await Order.find({partnerid: partnerid, status: status ,delivery : delivery});
    res.json({ objects: partnerdata });
  }
  start();
})

router.post('/saveorder',middleware, function (req, res) {
    async function start() {

	try{

      let id = "";
	const createorder = new Order({
     	partnerid : req.body.partnerid,  //id of partner
		delivery : false,  // delivered or not
		quoteid : req.body.orderdata?.quoteid,
		date : req.body.orderdata?.date,
    	details : req.body.details,
    	customerid : req.body.id,
		amount : req.body?.amount,
    	device : req.body.orderdata?.device,
		model : req.body.orderdata?.model,
	issue : req.body.orderdata?.issues,
	entry : {},  // will come after start reparing
	exit : {},   // will come if repairing pending so order is completed now
	deliveryform : {}, // order delivered to the customer
	status : "no", 
      });
      const result = await createorder.save();
      id = result['_id'];

	  //update the customer orders array
	const customer1 = await Customer.findOne( { _id: req.body.id });
	 await Customer.updateOne(
      { _id: req.body.id },
      { $push: { orders: id } }
    );
	sendWhatsappMsg({
		templateParams : [`${req.body.details?.deliverytype}`, `${req.body.details?.warranty}` , `${req.body.amount}`],
		destination : `+91${customer1?.phone}`,
		campaignName : 'Order Succesfully Created - Customer'
	})



	//update the partner orders array 
	const partner1 = await Partner.findOne( { _id: req.body.partnerid });
	await Partner.updateOne(
      { _id: req.body.partnerid },
      { $push: { orders: id } }
    );
	sendWhatsappMsg({
		templateParams : [`${req.body.details?.deliverytype}`, `${req.body.details?.warranty}` ,
		 `${req.body.amount}` , `${req.body.details?.quality}`],
		destination : `+91${partner1?.phone}`,
		campaignName : 'Order Placed - Partner'
	})

	sendMail({
		tomail : partner1?.emailId,
		subject : "Your order is saved",
		details : `Order is saved with the following details, Service - ${req.body.details?.deliverytype}, warranty - ${req.body.details?.warranty}, amount - ${req.body.amount} `
	})
	
	await Quote.updateOne({
		_id : req.body.orderdata?.quoteid
	},
	{
		$set : {activestate : false}
	})

	const subscriptionresult = await Subscription.find({userId : req.body.partnerid })

// 	subscriptionresult.forEach((subscription) => {
// 	const payload = JSON.stringify({
//     	title: `Order for ${req.body.orderdata?.model}`,
//     	body: `Amount ${req.body.amount}`,
//   });

//   webPush.sendNotification(subscription, payload)
//     .then(() => {
//       console.log('Notification sent successfully');
//     })
//     .catch((error) => {
//       console.error('Error sending notification:', error);
//     });
// 	});


      res.json({ message : "saved succesfully", id: id});
	  }
	  catch (error){
res.json({ message : "not saved", id: id});
	  }
    }
    start();
  }) ;


router.post('/entry', middleware, function (req, res) {
    async function start() {
		const result = await Order.updateOne(
      { _id: req.body.id },
      { $set: { entry: req.body.formdata, status : 'repairing' } } );
      console.log(result);
    res.json({ message: "entry form" });;
    }
    start();
  }) ;

router.post('/exit',middleware, function (req, res) {
    async function start() {
	      const result = await Order.updateOne(
      { _id: req.body.id },
      { $set: { exit: req.body.formdata, status : 'done' } } );
      console.log(result);
    res.json({ message: "exitform" });;
    }
    start();
  }) ;

router.post('/delivery',middleware, function (req, res) {
    async function start() {
	      const result = await Order.updateOne(
      { _id: req.body.id },
      { $set: { deliveryform: req.body.formdata, delivery:true } } );
      console.log(result);
      console.log('delivery')
    res.json({ message: "delivered" });;
    }
    start();
}) ;


router.post('/entryInspection', async(req,res) => {
  try {
    const result = await Order.updateOne(
      {_id: req.body.id},
      { $set: {entry: req.body.fromInfo, status: 'reparing'} }
    );
    console.log(result);
    console.log('entry')
    res.json({message: 'Entry Successful'})
  }
  catch(error) {
    console.log(error);
  }
})

router.post('/exitInspection', async(req,res) => {
  try {
    const result = await Order.updateOne(
      {_id: req.body.id},
      { $set: {exit: req.body.fromInfo, status: 'yes'} }
    );
    console.log(result);
    console.log('exit')
    res.json({message: 'Entry Successful'})
  }
  catch(error) {
    console.log(error);
  }
})

module.exports = router 
