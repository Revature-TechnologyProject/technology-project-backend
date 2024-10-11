const express = require('express');
const { createPost, createReply, seePosts } = require('../services/postService');
const { handleServiceError } = require('../utilities/routerUtilities');
const { authenticate } = require("../middleware/authMiddleware");
const { validateTextBody, validateScore } = require('../middleware/postMiddleware');


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
postRouter.post("/", authenticate, validateTextBody, validateScore, async (req, res) => {
    //TODO check song title exists in API
    try {
        await createPost(res.locals.user.username, req.body.text, req.body.score, req.body.title);
        res.status(200).json({
            message: "Post successfully created"
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
        const posts = await seePosts();
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
postRouter.patch("/replies", authenticate, validateTextBody, async (req, res) => {
    //TODO check song title exists in API
    try {
        await createReply(res.locals.user.username, req.body.text, req.body.id);
        res.status(200).json({
            message: "Reply successfully created"
        });
    } catch (err) {
        handleServiceError(err, res);
    }
});

module.exports = {
    postRouter
};