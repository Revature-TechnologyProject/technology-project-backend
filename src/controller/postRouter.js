const express = require('express');
const postService = require('../services/postService');
const { handleServiceError } = require('../utilities/routerUtilities');
const { authenticate, postOwnerOrAdminAuthenticate, replyOwnerOrAdminAuthenticate } = require("../middleware/authMiddleware");
const postMiddleware = require('../middleware/postMiddleware');

const postRouter = express.Router();

/**
 * Creates a new post in the database
 * Request Body
 *      title {string}
 *      score {number}
 *      text {string}
 * Response
 *      200 - Post successfully created
 */
postRouter.post("/", authenticate, postMiddleware.validateTextBody, postMiddleware.validateScore, async (req, res) => {
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

/**
 * Get all posts
 * Response
 *      200
 *          posts - Array of retrieved posts
 */
postRouter.get("/", async (req, res) => {
    //TODO check song title exists in API
    try {
        const posts = await postService.seePosts();
        res.status(200).json({
            posts: posts
        });
    } catch (err) {
        handleServiceError(err, res);
    }
});

/**
 * Add a reply to an existing post
 * Request Body
 *      id {string}
 *      text {string}
 * Response
 *      200 - Reply successfully created
 *      400 - That post doesn't exist
 */
postRouter.patch("/:id/replies", authenticate, postMiddleware.validateTextBody, async (req, res) => {
    //TODO check song title exists in API
    try {
        const reply = await postService.createReply(res.locals.user.itemID, req.body.text, req.params.id);
        res.status(200).json({
            message: `Replied to ${req.params.id} successfully`,
            Reply: reply
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