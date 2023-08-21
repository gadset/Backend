const express = require("express");
const webPush = require ('web-push');
const SubscriptionModel = require ('../models/subscriptionschema');
const router = express.Router();
const publicVapidKey = 'BMQOKdrpuYRNgI3wXtDoQstTJEt1rnO9w6b9KM3MnJek8V4DH72OYNYoACbpveEVg_1snYmI8EZIdJV_5qjfMo4';
const privateVapidKey = '8xw5QAlfRzN9TcZdUK2rI6zUx5AwBXMC0PbVPngST0E';
const Partner = require('../models/partnersch');
//setting vapid keys details
webPush.setVapidDetails('mailto:patnala.1@iitj.ac.in', publicVapidKey,privateVapidKey);

router.post('/subscribe', async (req, res, next) => {
    const subscription = req.body
    console.log(subscription)
  
    // const payload = JSON.stringify({
    //   title: 'Hello!',
    //   body: 'It works.',
    // })
  
    // webPush.sendNotification(subscription, payload)
    //   .then(result => console.log(result))
    //   .catch(e => console.log(e.stack))
  
    res.status(200).json({'success': true})
  });

  router.post('/subscribepartner', async (req, res, next) => {
    const subscription = req.body.subscription;
    const result = await Partner.updateOne(
      { _id: req.body.partnerid },
      { $set: { endpoint: req.body.subscription }}
    );
  
    // const payload = JSON.stringify({
    //   title: 'Hello!',
    //   body: 'partner is siginedin.',
    // });
    // webPush.sendNotification(subscription, payload)
    //   .then(result => console.log(result))
    //   .catch(e => console.log(e.stack));
  
    res.status(200).json({'success': true})
  });

module.exports = router;