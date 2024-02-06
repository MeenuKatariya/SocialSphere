const mongoose = require("mongoose");
const User = require("./userModal");

const postSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    caption: { type: String },
    likes: {
      list: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      count: { type: Number, default: 0 },

    },
    comments: {
      list: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
      text: [{ type: String, required: true }],
      count: { type: Number, default: 0 },
      timestamp: { type: Date, default: Date.now }
    },
    post:{ type: String },
    timestamp: { type: Date, default: Date.now }
  });
  

const Post = mongoose.model("Photo", postSchema);

module.exports = Post;