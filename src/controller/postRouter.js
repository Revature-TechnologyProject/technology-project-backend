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
postRouter.patch("/:postId/replies", authenticate, postMiddleware.validateTextBody, async (req, res) => {
    //TODO check song title exists in API
    const userId = res.locals.user.itemID;
    const { postId } = req.params;
    const { text } = req.body;

    try {
        const createdReply = await postService.createReply(userId, postId, text);
        res.status(200).json({
            message: `Replied to ${req.params.id} successfully`,
            createdReply: createdReply
        });
    } catch (err) {
        handleServiceError(err, res);
    }
});

postRouter.patch("/:id/likes", authenticate, postMiddleware.validateLike, async (req, res) => {
    //TODO check song title exists in API
    try {
        await postService.checkLike(req.body.like, req.params.id, res.locals.user.itemID);
        if (req.body.like == 1){
            res.status(200).json({
                message: `Liked post ${req.params.id} successfully`
            });
        }
        else {
            res.status(200).json({
                message: `Disliked post ${req.params.id} successfully`
            });
        }
    } catch (err) {
        handleServiceError(err, res);
    }
});

postRouter.delete("/:postId", postOwnerOrAdminAuthenticate, async (req, res) => {
    const { postId } = req.params;

    try {
        await postService.deletePost(postId);
        res.status(200).json({ message: "Deleted post", data: postId });
    } catch (err) {
        handleServiceError(err, res);
    }
});

postRouter.delete("/:postId/replies/:replyId", replyOwnerOrAdminAuthenticate, async (req, res) => {
    const { postId, replyId } = req.params;

    try {
        await postService.deleteReply(postId, replyId);
        res.status(200).json({ message: "Deleted reply" });
    } catch (err) {
        handleServiceError(err, res);
    }
});

module.exports = {
    postRouter
};