const express = require('express');
const postService = require('../services/postService');
const { handleServiceError } = require('../utilities/routerUtilities');
const { authenticate, postOwnerOrAdminAuthenticate, replyOwnerOrAdminAuthenticate } = require("../middleware/authMiddleware");
const { validateTextBody, validateScore } = require('../middleware/postMiddleware');


const postRouter = express.Router();

postRouter.post("/", authenticate, validateTextBody, validateScore, async (req, res) => {
    //TODO check song title exists in API
    const userId = res.locals.user.itemID;
    const { text, score, title } = req.body;

    try {
        const createdPost = await postService.createPost(userId, text, score, title);
        res.status(200).json({
            message: "Post successfully created",
            createdPost: createdPost
        });
    } catch (err) {
        handleServiceError(err, res);
    }
});

postRouter.get("/", async (req, res) => {
    //TODO check song title exists in API
    try {
        const posts = await postService.seePosts();
        res.status(200).json({
            Posts: posts
        });
    } catch (err) {
        handleServiceError(err, res);
    }
});

postRouter.patch("/:postId/replies", authenticate, validateTextBody, async (req, res) => {
    //TODO check song title exists in API
    const userId = res.locals.user.itemID;
    const { postId } = req.params;
    const { text } = req.body;

    try {
        const createdReply = await postService.createReply(userId, postId, text);
        res.status(200).json({
            message: "Reply successfully created",
            createdReply: createdReply
        });
    } catch (err) {
        handleServiceError(err, res);
    }
});

postRouter.delete("/:postId", postOwnerOrAdminAuthenticate, async (req, res) => {
    const { postId } = req.params;
    //const userId = res.locals.user.itemID;
    //const { role } = res.locals.user;

    try {
        /*
        const foundPost = await postService.getPostById(postId);
        if (!(foundPost.postedBy === userId || role === "admin")) {
            return res.status(400).json({ message: "Unauthorized access - wrong user or not admin" });
        }
        */
        await postService.deletePost(postId);
        res.status(200).json({ message: "Deleted post", data: postId });
    } catch (err) {
        handleServiceError(err, res);
    }
});

postRouter.delete("/:postId/replies/:replyId", replyOwnerOrAdminAuthenticate, async (req, res) => {
    const { postId, replyId } = req.params;
    //const userId = res.locals.user.itemID;
    //const { role } = res.locals.user;

    try {
        /*
        const foundReply = await postService.getReplyOfPost(postId, replyId);
        if (!(foundReply.postedBy === userId || role === "admin")) {
            return res.status(400).json({ message: "Unauthorized access - wrong user or not admin" });
        }
        */
        await postService.deleteReply(postId, replyId);
        res.status(200).json({ message: "Deleted reply" });
    } catch (err) {
        handleServiceError(err, res);
    }
});

module.exports = {
    postRouter
};