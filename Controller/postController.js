const User = require("../Modal/userModal");
const Post = require("../Modal/postSchema");
const jwt = require("jsonwebtoken");

const addPost = async (req, res) => {
  try {

    const { userId, post, likes, comments, caption } = req.body;
    console.log(userId, post, likes, comments, caption)
    const { token } = req.headers;

    const checkUserById = await User.findById(userId);
    if (!checkUserById) {
      return res.status(400).send({ message: "user not exist" });
    }

    const postData = await Post.create({
      userId: checkUserById._doc,
      post,
      likes,
      comments,
      caption,
    });
    console.log(postData);
    if (postData) {
      res.status(200).json({
        _id: postData.id,
        post: postData.post,
        userId: checkUserById._doc,
        likes: postData.likes,
        comments: postData.comments,
        caption: postData.caption,
        timestamp: postData.timestamp,
      });
    } else {
      res.status(400);
      throw new Error("User not found");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const allPost = async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 0; 
    const count = parseInt(req.query.count) || 10; 
    const allPost = await Post.find().populate([
      { path: "userId" },
      {
        path: "comments",
        populate: {
          path: "list",
          populate: {
            path: "createdBy",
          },
        },
      },
    ]);
  
    if (!allPost) {
      return res.status(400).send({ message: "No Post " });
    }
   
    const startIndex = Math.max(0, start) * count;
    const endIndex = Math.min(startIndex + count, allPost.length);
  
    const results = allPost.slice(startIndex, endIndex);
    // const totalPost = allPost.slice((page - 1) * limit, page * limit);

    return res.status(200).send(results);
   
  } catch (err) {
    res.status(500).json(err);
  }
};



const deletePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const { token } = req.headers;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userPost = await Post.findById(postId);
    if (!userPost) {
      return res.status(400).send({ message: "Post does not exist" });
    }
    const { userId } = userPost;
    if (userId != decoded.id) {
      return res.status(400).send({ message: "You  does not delete the Post" });
    }

    await Post.findByIdAndDelete(userPost);
    return res.status(200).send({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};

const likePost = async (req, res) => {
  try {
    // console.log(req)
    const { postId } = req.body;
    console.log(postId);

    const { token } = req.headers;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) {
      return res.status(400).send({ message: "User Not Exist" });
    }
    const checkLoginUser = await User.findById(decoded.id);

    const userPost = await Post.findById(postId);
    console.log({ userPost });
    if (!userPost) {
      return res.status(400).send({ message: "Post does not exist" });
    }

    const {
      _id: id = "",
      likes: { list: likeList = [], count: likesCount = 0 } = {},
    } = userPost || {};
    const updatedLike = [...likeList].map((mongoId) => mongoId.toString());
    let updatedCount = likesCount;
    if (updatedLike.includes(decoded.id)) {
      return res
        .status(201)
        .send({ message: "You have already liked this post" });
    } else {
      updatedLike.push(decoded.id);
      updatedCount = updatedLike.length;
      let updatedResult = await Post.findByIdAndUpdate(id, {
        likes: { count: updatedCount, list: updatedLike },
      });
      console.log(updatedResult);
      return res
        .status(200)
        .send({ result: updatedResult, message: "Post liked successfully" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const dislikePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const { token } = req.headers;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) {
      return res.status(400).send({ message: "User Not Exist" });
    }
    const checkLoginUser = await User.findById(decoded.id);

    const userPost = await Post.findById(postId);
    if (!userPost) {
      return res.status(400).send({ message: "Post does not exist" });
    }
    const {
      _id: id = "",
      likes: { list: likeList = [], count: likesCount = 0 } = {},
    } = userPost || {};
    const updatedLike = [...likeList].map((mongoId) => mongoId.toString());
    let updatedCount = likesCount;
    if (updatedLike.includes(decoded.id)) {
      updatedLike.pop(decoded.id);
      updatedCount = updatedLike.length;
      let updatedResult = await Post.findByIdAndUpdate(id, {
        likes: { count: updatedCount, list: updatedLike },
      });
      console.log(updatedResult);
      return res.status(200).send({ message: "Dislike liked successfully" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const commentPost = async (req, res) => {
  try {
    const { postId, comment } = req.body;
    const { token } = req.headers;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) {
      return res.status(400).send({ message: "User Not Exist" });
    }

    const userPost = await Post.findById(postId);
    if (!userPost) {
      return res.status(400).send({ message: "Post does not exist" });
    }

    const {
      _id: id = "",
      comments: { list: commentList = [], count: commentsCount = 0 } = {},
    } = userPost || {};

    const userIdsForComment = commentList.map(({ createdBy = "" }) =>
      createdBy.toString()
    );

    if (userIdsForComment.includes(decoded.id)) {
      return res
        .status(400)
        .send({ message: "You have already comment this post" });
    } else {
      await Post.findByIdAndUpdate(id, {
        comments: {
          count: commentsCount + 1,
          list: [...commentList, { createdBy: decoded.id, comment }],
        },
      });
      // console.log(updatedResult);
      return res.status(200).send({ message: "Comment successfully" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteComment = async (req, res) => {
  try {
    const { postId } = req.body;
    const { token } = req.headers;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) {
      return res.status(400).send({ message: "User Not Exist" });
    }

    const userPost = await Post.findById(postId);
    if (!userPost) {
      return res.status(400).send({ message: "Post does not exist" });
    }
    const {
      _id: id = "",
      comments: { list: commentList = [], count: commentsCount = 0 } = {},
    } = userPost || {};
    // console.log(commentList)
    const userIdsForComment = commentList.map(({ createdBy = "" }) =>
      createdBy.toString()
    );

    if (userIdsForComment.includes(decoded.id)) {
      const deleteComment = commentList.filter(
        (user) => user.createdBy.toString() !== decoded.id
      );
      await Post.findByIdAndUpdate(id, {
        comments: {
          count: deleteComment.length || 0,
          list: deleteComment,
        },
      });
      return res.status(200).send({ message: "Comment Delete successfully" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const userPost = async (req, res) => {
  try {
    const {userId = ""} = req.params;
    const userPost = await Post.find({userId:userId})
    if (!userPost) {
      return res.status(400).send({ message: "No Post" });
    }else{
      return res.status(200).send(userPost);
    }
   } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  addPost,
  deletePost,
  likePost,
  dislikePost,
  commentPost,
  deleteComment,
  allPost,
  userPost
};
