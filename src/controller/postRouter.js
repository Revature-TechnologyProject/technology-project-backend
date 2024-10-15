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
 *      tags {string,string,...}
 * Response
 *      200 - Post successfully created
 */
postRouter.post("/", authenticate, postMiddleware.validateTextBody, postMiddleware.validateScore, async (req, res) => {
    //TODO check song title exists in API
    try {
        const post = await postService.createPost(res.locals.user.itemID, req.body.text, req.body.score, req.body.title, req.body.tags);
        res.status(200).json({
            message: `Post successfully created`,
            post
        });
    } catch (err) {
        handleServiceError(err, res);
    }
});

postRouter.patch("/:id", authenticate, async (req, res) => {
    const {id} = req.params;
    try {
        const {Item} = await postService.getPost(id);
        const post = Item;
        const {user} = res.locals;
        if (user.role === "user" && post.postedBy !== user.itemID) {
            const {flag} = req.body;
            await postService.updatePostFlag(id, flag);
            return res.status(200).json({id, updated: {isFlagged: flag}})
        } else if (user.role === "admin" || post.postedBy === user.itemID) {
            // Only get updatable fields from the body
            const {description, title, score} = req.body;
            let {flag} = req.body;
            if (flag !== undefined && post.postedBy === user.itemID) {
                flag = undefined; // Users cannot flag/unflag their own post
            }
            const updated = await postService.updatePost(id, post, {description: description, title: title, score: score, isFlagged: flag});
            return res.status(200).json({id, updated});
        }
    } catch (err) {
        handleServiceError(err, res);
    }
});

postRouter.get("/:id", async (req, res) => {
    const {id} = req.params;
    try {
        const post = await postService.getPost(id);
        res.status(200).json(post.Item);
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
    let isFlagged = req.query.isFlagged;
    if (isFlagged !== undefined) {
        isFlagged = parseInt(isFlagged);
        // Since 0 is falsy we need to confirm its not 0
        if (!isFlagged && isFlagged !== 0) {
            return res.status(400).json({message: "isFlagged query must be 0 or 1"})
        }
        try {
            const flaggedPost = await postService.getFlaggedPost(isFlagged);
            return res.status(200).json({flaggedPost});
        } catch (err) {
            handleServiceError(err, res);
        }
    } else {
        //TODO check song title exists in API
        try {
            const posts = await postService.seePosts();
            res.status(200).json({
                posts: posts
            });
        } catch (err) {
            handleServiceError(err, res);
        }
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