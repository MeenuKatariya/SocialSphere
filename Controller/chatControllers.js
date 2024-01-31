const Chat = require("../Modal/chatModal");
const User = require("../Modal/userModal");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = async (req, res) => {
  const { userId } = req.body; // second person to chat

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    $and: [
      // need two user for one to one,  one is login and second send by body
      { users: { $elemMatch: { $eq: req.user._id } } }, // match with chat schema users first is login user
      { users: { $elemMatch: { $eq: userId } } }, // second is send by body id user
    ],
  })
    // if all match ischat then we taking all data of users by chat schema

    .populate("users", "-password") // taking data by user and forget password - populate -password means - no need of password
    .populate("latestMessage"); // also taking latest mesaage from chat schema

  isChat = await User.populate(isChat, {
    // link with user login
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    // if there is chat both two people length >0
    res.send(isChat[0]); // send first chat
  } else {
    var chatData = {
      // new object of chat that is crated
      chatName: "sender",
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData); // chat create in database
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        // full chat of two people
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
};

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } }) // chat find related to user , show user
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

module.exports = {
  accessChat,
  fetchChats,
};
