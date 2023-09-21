const express = require('express')
const Order = require('../models/Ordersch');
const router = express.Router();

router.get('/getorders', function(req,res){
	async function start() {
    const partnerid = req.query.id;
	const status = req.query.status;
	const delivery = req.query.delivery;
    const partnerdata = await Partner.find({_id : partnerid, status: status ,delivery : delivery});
    res.json({ objects: partnerdata });
  }
  start();
})

router.post('/', function (req, res) {
    async function start() {
      let id = "";
	  console.log("yes running")
	   const createorder = new Order({
     partnerid : req.body.partner['partnerid'],  //id of partner
	delivery : false,  // delivered or not
    paymenttotal : req.body.amount, 
	paymentdone : req.body.partner['amount'],
    customerid : req.body.customerid,
    device : req.body.model,
	issue : req.body.issues,
	entry : {},  // will come after start reparing
	exit : {},   // will come if repairing pending so order is completed now
	deliveryform : {}, // order delivered to the customer
	status : "no", 
      });
      const result = await createorder.save();
      console.log(result["_id"]);
      id = result['_id'];
      res.json({ id: id});
    }

    start();
  }) ;


router.post('/entry', function (req, res) {
    async function start() {
	      const result = await Order.updateOne(
      { _id: req.body.id },
      { $set: { entry: req.body.formdata, status : 'repairing' } } );
      console.log(result);
    res.json({ message: "entry form" });;
    }
    start();
  }) ;

router.post('/exit', function (req, res) {
    async function start() {
	      const result = await Order.updateOne(
      { _id: req.body.id },
      { $set: { exit: req.body.formdata, status : 'done' } } );
      console.log(result);
    res.json({ message: "exitform" });;
    }
    start();
  }) ;

router.post('/delivery', function (req, res) {
    async function start() {
	      const result = await Order.updateOne(
      { _id: req.body.id },
      { $set: { deliveryform: req.body.formdata, delivery:true } } );
      console.log(result);
    res.json({ message: "delivered" });;
    }
    start();
  }) ;



  module.exports = router 