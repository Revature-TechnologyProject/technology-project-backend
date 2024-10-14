const express = require("express");
const cors = require("cors");
const { userRouter } = require("./controller/userRouter");
const { postRouter } = require("./controller/postRouter");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Routes
app.use("/users", userRouter);
app.use("/posts", postRouter);


app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));