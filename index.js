const express = require("express");
const cors = require("cors");
const { connectDB } = require("./database/index");
const  userRouter  = require("./Router/userRouter");
const  photosRouter  = require("./Router/postRouter");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const  chatRouter  = require("./Router/chatRouter")
const messageRouter = require("./Router/messageRouter")
connectDB();
// require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/user", userRouter);
app.use("/post", photosRouter);
app.use("/chat", chatRouter);
app.use("/message", messageRouter);

app.use(notFound);
app.use(errorHandler); 


app.get("/", (req,res) =>{
    res.send('Api is Run')
})

const Port = 5000;
app.listen(Port, () =>{
    console.log(`Server Connect ${Port}`)
})


