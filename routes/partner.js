//const mongoose = require('mongoose');
const express = require('express')
const Partner = require('../models/partnersch');
const router = express.Router();
// mongoose.connect('mongodb+srv://kiran333:kiran333@cluster0.h8q8rtb.mongodb.net/?retryWrites=true&w=majority')
// .then(()=>{
//     console.log('Connected to database!')
// }).catch(()=>{
//     console.log('Connection failed')
// });

router.post('/', function (req, res) {
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
      }
      else{
        id = cuscheck[0]['_id'];
      }
      res.json({ id: id});
    }

    start();
  }) ;


router.get('/checkpartner', function (req, res){
	async function start(){
		console.log(req.query.phone);
		const result = await Partner.find({phone : req.query.phone});
		var id = '';
		if(result[0]) { id = result[0]._id ;}
		console.log(id);
		res.json({partnerid : id});
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
module.exports = router 
//exports.createPartner = createPartner;