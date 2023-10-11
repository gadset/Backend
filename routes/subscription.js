const express = require("express");
const webPush = require ('web-push');
const SubscriptionModel = require ('../models/subscriptionschema');
const router = express.Router();
const publicVapidKey = 'BJs-1rAgTehzrIsAOwkqNHiwhTNB2Iudrw5XRzAen9wFcpcvICqVzpxwA7vwdyT1grGNOaKW9kdconwzjnHWWIg';
const privateVapidKey = 'yRBdMIDs9GKjHqPytBgV0jyYrrMkF_IRbNWRH9kplaI';
const Partner = require('../models/partnersch');
const middleware = require('../middleware');


//setting vapid keys details

webPush.setVapidDetails('mailto:geda.1@iitj.ac.in', publicVapidKey,privateVapidKey);

router.post('/subscribe', async (req, res, next) => {
  console.log("Hello")
    const user = req.body.user;
    const subscription = req.body.subscription;
    console.log("Sub", subscription)
    try {
      // Create a new Subscription document and save it to the database
      const sub = new SubscriptionModel({
        user: user, // Assuming you have a 'user' property in your subscription data
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      });
  
      await sub.save();
      console.log('Subscription saved:', sub);
      res.status(200).json({ success: true });
  } catch (error) {
      console.error('Error saving subscription:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

function sendBidNotification(userId, bidData) {
  const usercheck = userSubscriptions.has(userId);
  const subscription = userSubscriptions.get(userId);

  if (!usercheck) {
    console.error('User not found or not subscribed');
    return;
  }

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

router.post('/subscribepartner', async (req, res, next) => {
    const subscription = req.body.subscription;
    const result = await Partner.updateOne(
      { _id: req.body.partnerid },
      { $set: { endpoint: req.body.subscription }}
    );
    res.status(200).json({'success': true})
  });

module.exports = router;