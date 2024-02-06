const User = require("../Modal/userModal");
const Post = require("../Modal/postSchema");
const jwt = require("jsonwebtoken");
const addPost = async (req, res) => {
  try {
    const { userId, post, likes, comments, caption } = req.body;
    const { token } = req.headers;
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // if(decoded.id != userId){
    //   return res.status(400).send({ message: "user not exist" });
    // }
    const checkUserById = await User.findById(userId);
    if (!checkUserById) {
      return res.status(400).send({ message: "user not exist" });
    }

    if (checkUserById) {
    }
    const postData = await Post.create({
      userId,
      post,
      likes,
      comments,
      caption,
    });
    if (postData) {
      res.status(201).json({
        _id: postData.id,
        post: postData.post,
        likes: postData.likes,
        comments: postData.comments,
        caption: postData.caption,
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
    const { limit = 5, page = 1 } = req.query;
    // console.log(req.query);
    const userPost = await Post.find().populate("userId");
    if (!userPost) {
      return res.status(400).send({ message: "No Post " });
    }

    const post = userPost.slice((page - 1) * limit, page * limit);
    return res.status(200).send(post);
  } catch (err) {
    res.status(500).json(err);
  }
};

const allComment = async (req, res) => {
  try {
    const userPost = await Post.find().populate("comments.list","username");
    return res.status(200).send(userPost);
    console.log(userPost)
    if (!userPost) {
      return res.status(400).send({ message: "No Post " });
    }

    // return res.status(200).send(post);
  } catch (err) {
    res.status(500).json(err);
  }
};

const countPost = async (req, res) => {
  try {
    const countPost = await Post.find().count();
    if (!countPost) {
      return res.status(400).send({ message: "No Post " });
    }
    return res.status(200).send(countPost);
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
    const { postId } = req.body;
    console.log(postId);

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
      return res
        .status(400)
        .send({ message: "You have already liked this post" });
    } else {
      updatedLike.push(decoded.id);
      updatedCount = updatedLike.length;
      let updatedResult = await Post.findByIdAndUpdate(id, {
        likes: { count: updatedCount, list: updatedLike },
      });
      console.log(updatedResult);
      return res.status(200).send({ message: "Post liked successfully" });
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
    const { postId, text } = req.body;
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
      comments: {
        list: commentList = [],
        count: commentsCount = 0,
        text: commentText = [],
      } = {},
    } = userPost || {};
    const updatedComment = [...commentList].map((mongoId) =>
      mongoId.toString()
    );
    let updatedCount = commentsCount;
    let updatedText = commentText;
    if (updatedComment.includes(decoded.id)) {
      return res
        .status(400)
        .send({ message: "You have already comment this post" });
    } else {
      updatedComment.push(decoded.id);
      updatedCount = updatedComment.length;
      updatedText.push(text);

      let updatedResult = await Post.findByIdAndUpdate(id, {
        comments: {
          count: updatedCount,
          list: updatedComment,
          text: updatedText,
        },
      });
      console.log(updatedResult);
      return res.status(200).send({ message: "Comment successfully" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteComment = async (req, res) => {
  try {
    const { postId, text } = req.body;
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
      comments: {
        list: commentList = [],
        count: commentsCount = 0,
        text: commentText = [],
      } = {},
    } = userPost || {};
    const updatedComment = [...commentList].map((mongoId) =>
      mongoId.toString()
    );
    let updatedCount = commentsCount;
    let updatedText = commentText;
    if (updatedComment.includes(decoded.id)) {
      updatedComment.pop(decoded.id);
      updatedCount = updatedComment.length;
      updatedText.pop(text);

      let updatedResult = await Post.findByIdAndUpdate(id, {
        comments: {
          count: updatedCount,
          list: updatedComment,
          text: updatedText,
        },
      });
      console.log(updatedResult);
      return res.status(200).send({ message: "Comment Delete successfully" });
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
  countPost,
  allComment
};
