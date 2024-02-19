const express = require("express");
const {
    accessChat,
    fetchChats,
  } = require("../Controller/chatControllers");
  const  { protect } = require("../middleware/protect");

const router = express.Router();
router.route("/").post(accessChat);
router.route("/").get(protect, fetchChats);


module.exports = router;

