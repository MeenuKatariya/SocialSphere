const User = require("../Modal/userModal");
const generateToken = require("../database/generateToken");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();

const registerUser = async (req, res) => {
  try {
    const { name, username, email, pic, password, followers, following } =
      req.body;
    if (!name || !email || !password || !username) {
      return res.status(400).json({error:"Please Enter all the Feilds"})
      
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
    const userName = await User.findOne({ username });

    if (userName) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      username,
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
        userName: user.username,
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
    const { email, username, password } = req.body;
    // console.log(email, password);
    if (email) {
      const user = await User.findOne({ email }).populate("password");
      console.log(user);
      if (!user) {
        return res.status(400).send({
          message: "User does not exist",
        });
      } else {
        if (user.password === password) {
          const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            process.env.JWT_SECRET
          );
          return res.status(200).send({ token });
        } else {
          return res.status(400).send({
            message: "Password is incorrect",
          });
        }
      }
    } else if (username) {
      const user = await User.findOne({ username }).populate("password");
      console.log(user);
      if (!user) {
        return res.status(400).send({
          message: "User does not exist",
        });
      } else {
        console.log(user.password, password);
        if (user.password === password) {
          const token = jwt.sign(
            {
              id: user._id,
              email: user.email,
              name: user.name,
              username: user.username,
            },
            process.env.JWT_SECRET
          );
          return res.status(200).send({ token });
        } else {
          return res.status(400).send({
            message: "Password is incorrect",
          });
        }
      }
    }

    const user = await User.findOne({ email }).populate("password");
    console.log(user);
    if (!user) {
      return res.status(400).send({
        message: "User does not exist",
      });
    } else {
      console.log(user.password, password);
      if (user.password === password) {
        const token = jwt.sign(
          { id: user._id, email: user.email, name: user.name },
          process.env.JWT_SECRET
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded)
    const user = await User.findById(decoded.id);
    console.log(user)
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
    console.log(checkId)
    if (!checkId) {
      return res.status(400).send({ message: "User Not Exist" });
    }

    const { token } = req.headers;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    console.log(user)
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

const singleUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const userExist = await User.findById(userId);
    if (!userExist) {
      return res.status(400).send({ message: "User Not Exist" });
    }
  } catch (err) {
    console.log(err);
  }
};

const searchUser = async (req, res) => {
  try {
    // const { token } = req.headers;
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

    if (!users) {
      return res.status(400).send({ message: "User Not Exist" });
    } else {
      res.send(users);
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  registerUser,
  login,
  checkUserByToken,
  followUser,
  unFollowUser,
  singleUser,
  searchUser,
};