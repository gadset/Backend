require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();

router.post("/order", async (req, res) => {
    try {
        const instance = new Razorpay({
            key_id: 'rzp_test_hjnHnpkynNqw7v',
            key_secret: 'nc09IOkWivlgjORqBqWLaXJA',
        });

        const options = {
            amount: req.body.amount, // amount in smallest currency unit
            currency: "INR",
            receipt: "receipt_order_74394",
        };
        const order = await instance.orders.create(options);
        console.log("running");
        if (!order) return res.status(500).send("Some error occured");

        res.json(order);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.post("/success", async (req, res) => {
      try {
          // getting the details back from our font-end
		  console.log("body of the request", req?.body?.orderCreationId);
          const {
              orderCreationId,
              razorpayPaymentId,
              razorpayOrderId,
              razorpaySignature,
          } = req.body;

		  console.log("id", orderCreationId);
    
          const shasum = crypto.createHmac("sha256", "w2lBtgmeuDUfnJVp43UpcaiT");
    
          shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
    
          const digest = shasum.digest("hex");
    
          // comaparing our digest with the actual signature
        //   if (digest !== razorpaySignature)
        //       return res.status(400).json({ msg: "Transaction not legit!" });
    
          // THE PAYMENT IS LEGIT & VERIFIED
          // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT
    
          res.json({
              message: "success"
          });
      } catch (error) {
          res.status(500).send(error);
		  console.log(error);
      }
    });
    

module.exports = router ;