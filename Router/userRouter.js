const express = require("express");
const { registerUser, login, checkUserByToken, followUser, unFollowUser, singleUser, searchUser } = require("../Controller/userController");


const router = express.Router();

router.route("/registerUser").post(registerUser)
router.route("/login").post(login)
router.route("/checkUserByToken").post(checkUserByToken);
router.route("/followUser/:userId").post(followUser);
router.route("/unFollow/:userId").post(unFollowUser);
router.route("/singleUser/:userId").post(singleUser);
router.route("/searchUser").post(searchUser);

module.exports = router; 