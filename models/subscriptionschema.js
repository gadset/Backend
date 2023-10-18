const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const Subscription = new Schema ({
  endpoint: String,
  expirationTime: Number,
  keys: {
    p256dh: String,
    auth: String,
  },
  user: {type: String},
});
module.exports = mongoose.model ('subscription', Subscription);