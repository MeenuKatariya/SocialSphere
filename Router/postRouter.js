const express = require("express");
const { addPost, deletePost, likePost, dislikePost, commentPost, deleteComment, allPost , userPost} = require("../Controller/postController");


const router = express.Router();

router.route("/addPost").post(addPost);
router.route("/allPost").get(allPost);
router.route("/deletePost").post(deletePost)
router.route("/likePost").post(likePost);
router.route("/dislikePost").post(dislikePost);
router.route("/commentPost").post(commentPost);
router.route("/deleteComment").post(deleteComment);
router.route("/userPost/:userId").get(userPost);
// router.route("/searchUser").post(searchUser);

module.exports = router; 