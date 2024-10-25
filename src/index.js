const https = require("https");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { userRouter } = require("./controller/userRouter");
const { postRouter } = require("./controller/postRouter");
const songRouter = require("./controller/songRouter");
require("dotenv").config();

let key;
let cert;
try {
    key = fs.readFileSync("tech-project-key.pem");
    cert = fs.readFileSync("tech-project.pem");
} catch (err) {
    console.log("One or more .pem files not found, using HTTP instead");
}
const options = {
    key: key,
    cert: cert
};
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "1000kb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
    res.send("Test");
})
app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/songs", songRouter);

if (key && cert) {
    const server = https.createServer(options, app);
    server.listen(PORT, () => console.log(`Server listening on https://localhost:${PORT}`));
} else {
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}
