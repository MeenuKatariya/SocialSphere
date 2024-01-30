const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: { type: String },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", Message);
module.exports = Message;
