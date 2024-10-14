const express = require('express');
const postService = require('../services/postService');
const { handleServiceError } = require('../utilities/routerUtilities');
const { authenticate } = require("../middleware/authMiddleware");
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
    try {
        await postService.createPost(res.locals.user.itemID, req.body.text, req.body.score, req.body.title, req.body.tags);
        res.status(200).json({
            message: `Post successfully created`
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
postRouter.post("/tags", async (req, res) => {
    try {
        const posts = await postService.checkTags(req.body.tags, req.body.inclusive);
        res.status(200).json({
            Posts: posts
        });
    } catch (err) {
        handleServiceError(err, res);
    }
})

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

module.exports = {
    postRouter
};