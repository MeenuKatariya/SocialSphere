const express = require("express");
const { addPost, deletePost, likePost, dislikePost, commentPost, deleteComment, allPost, countPost, allComment } = require("../Controller/postController");


const router = express.Router();

router.route("/addPost").post(addPost);
router.route("/allPost").get(allPost);
router.route("/allComment").get(allComment);
router.route("/countPost").post(countPost);
router.route("/deletePost").post(deletePost)
router.route("/likePost").post(likePost);
router.route("/dislikePost").post(dislikePost);
router.route("/commentPost").post(commentPost);
router.route("/deleteComment").post(deleteComment);
// router.route("/searchUser").post(searchUser);

module.exports = router; 