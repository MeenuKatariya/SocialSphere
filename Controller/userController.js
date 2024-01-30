const User = require("../Modal/userModal");
const generateToken = require("../database/generateToken");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();

const registerUser = async (req, res) => {
  try {
    const { name, email, pic, password, followers, following } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please Enter all the Feilds");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address." });
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Invalid password. Password must be at least 8 characters long and contain at least one letter and one number.",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      pic,
      followers,
      following,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        followers: user.followers,
        following: user.following,
        token: user._id,
      });
    } else {
      res.status(400);
      throw new Error("User not found");
    }
  } catch (err) {
    console.log(err);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(email, password);

    const user = await User.findOne({ email }).populate("password");
    // console.log(user)
    if (!user) {
      return res.status(400).send({
        message: "User does not exist",
      });
    } else {
      if (user.password === password) {
        const token = jwt.sign(
          { id: user._id, email: user.email, name: user.name },
          "hgfdsvhjnh"
        );
        return res.status(200).send({ token });
      } else {
        return res.status(400).send({
          message: "Password is incorrect",
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const checkUserByToken = async (req, res) => {
  try {
    const { token } = req.headers;
    const decoded = jwt.verify(token, "hgfdsvhjnh");
    if (decoded) {
      return res.status(200).send({ token });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Follow User, Following

const followUser = async (req, res) => {
  try {
    const { userId = "" } = req.params;
    const checkId = await User.findById(userId);
    if (!checkId) {
      return res.status(400).send({ message: "User Not Exist" });
    }

    const { token } = req.headers;
    const decoded = jwt.verify(token, "hgfdsvhjnh");
    const user = await User.findById(decoded.id);
    const {
      _id: id = "",
      following: { list: followingList = [], count: followingCount = 0 } = {},
    } = user || {};

    const updatedFollowingList = [...followingList].map((mongoId) =>
      mongoId.toString()
    );

    let updatedFollowingCount = followingCount;
    if (updatedFollowingList.includes(userId)) {
      return res.status(400).send({ message: "Already following" });
    } else {
      updatedFollowingList.push(userId);
      updatedFollowingCount = updatedFollowingList.length;
      await User.findByIdAndUpdate(id, {
        following: { count: updatedFollowingCount, list: updatedFollowingList },
      });
    }

    const followUser = await User.findById(userId);
    console.log("decode", decoded);
    const {
      _id: followerId = "",
      followers: { list: followerList = [], count: followerCount = 0 } = {},
    } = followUser || {};

    const updatedFollowerList = [...followerList].map((mongoId) =>
      mongoId.toString()
    );

    let updatedFollowerCount = followerCount;
    if (updatedFollowerList.includes(decoded.id)) {
      return res.status(400).send({ message: "Already follower" });
    } else {
      updatedFollowerList.push(decoded.id);
      updatedFollowerCount = updatedFollowerList.length;
      const updatedUser = await User.findByIdAndUpdate(followerId, {
        followers: { count: updatedFollowerCount, list: updatedFollowerList },
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const unFollowUser = async (req, res) => {
  try {
    const { userId = "" } = req.params;
    const checkId = await User.findById(userId);
    if (!checkId) {
      return res.status(400).send({ message: "User Not Exist" });
    }

    const { token } = req.headers;
    const decoded = jwt.verify(token, "hgfdsvhjnh");
    const user = await User.findById(decoded.id);
    const {
      _id: id = "",
      following: { list: followingList = [], count: followingCount = 0 } = {},
    } = user || {};

    const updatedFollowingList = [...followingList].map((mongoId) =>
      mongoId.toString()
    );

    let updatedFollowingCount = followingCount;
    if (updatedFollowingList.includes(userId)) {
      updatedFollowingList.pop(userId);
      updatedFollowingCount = updatedFollowingList.length;
      await User.findByIdAndUpdate(id, {
        following: { count: updatedFollowingCount, list: updatedFollowingList },
      });
    }

    const followUser = await User.findById(userId);
    console.log("decode", decoded);
    const {
      _id: followerId = "",
      followers: { list: followerList = [], count: followerCount = 0 } = {},
    } = followUser || {};
    const updatedFollowerList = [...followerList].map((mongoId) =>
      mongoId.toString()
    );
    let updatedFollowerCount = followerCount;
    if (updatedFollowerList.includes(decoded.id)) {
      updatedFollowerList.pop(decoded.id);
      updatedFollowerCount = updatedFollowerList.length;
      const updatedUser = await User.findByIdAndUpdate(followerId, {
        followers: { count: updatedFollowerCount, list: updatedFollowerList },
      });
      return res.status(400).send({ message: "Remove Follower" });
    }
  } catch (err) {
    console.log(err);
  }
};
  
  const singleUser = async(req,res) => {
    try{
      const { userId} = req.params;
      const userExist = await User.findById(userId);
      if(!userExist){
        return res.status(400).send({ message: "User Not Exist" });
      }

    }catch(err){
        console.log(err)
    }
  }

  const searchUser = async(req,res) => {
    try{
      const { name } = req.body;
      const checkUserName = await User.findOne({name});
      console.log(checkUserName)
    }catch(err){
        console.log(err)
    }
  }

module.exports = {
  registerUser,
  login,
  checkUserByToken,
  followUser,
  unFollowUser,
  singleUser,
  searchUser
};
