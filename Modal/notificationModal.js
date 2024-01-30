const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;