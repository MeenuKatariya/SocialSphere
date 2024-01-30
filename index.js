const express = require("express");
const cors = require("cors");
const { connectDB } = require("./database/index");
const  userRouter  = require("./Router/userRouter")
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", userRouter);

app.get("/", (req,res) =>{
    res.send('Api is Run')
})

const Port = 5000;
app.listen(Port, () =>{
    console.log(`Server Connect ${Port}`)
})


