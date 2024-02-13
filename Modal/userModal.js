const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  name: { type: "String", required: true },
  username: { type: "String", required: true, unique: true },
  email: { type: "String", required: true, unique: true, immutable: true },
  password: { type: "String", required: true },
  profilePicture: {
    type: "String",
    default:
      "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  },
  followers: {
    list: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    count: { type: Number, default: 0 },
  },
  following: {
    list: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    count: { type: Number, default: 0 },
  },
  bio: { type: "String" },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
