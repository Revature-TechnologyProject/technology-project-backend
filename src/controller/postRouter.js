const express = require('express');
const postService = require('../services/postService');
const { handleServiceError } = require('../utilities/routerUtilities');
const authMiddleware = require("../middleware/authMiddleware");
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
postRouter.post("/", authMiddleware.authenticate(), postMiddleware.validateTextBody(), postMiddleware.validateScore(), postMiddleware.validateTitle(), async (req, res) => {
    //TODO check song title exists in API
    const { text, score, title } = req.body;

    try {
        await postService.createPost(res.locals.user.username, text, score, title);
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
 *      400 - Post ${id} not found
 */
postRouter.patch("/:id/replies", authMiddleware.authenticate(), postMiddleware.validateTextBody(), async (req, res) => {
    //TODO check song title exists in API
    const { text, id } = req.body;

    try {
        const reply = await postService.createReply(res.locals.user.itemID, text, id);
        res.status(200).json({
            message: `Replied to ${req.params.id} successfully`,
            Reply: reply
        });
    } catch (err) {
        handleServiceError(err, res);
    }
});

/**
 * Update an existing post; must be post owner
 * Path Parameter
 *      :id {string} - The id of the post being updated
 * Request Body
 *      title {string}
 *      score {number}
 *      description {string}
 * Response
 *      200 - Updated post
 *          postId {string}
 *      400 - Post ${id} not found
 */
postRouter.patch("/:id", authMiddleware.postOwnerAuthenticate(), postMiddleware.validateTitle(false), postMiddleware.validateScore(false), postMiddleware.validateTextBody(false),
    async (req, res) => {
        const postId = req.params.id;
        const { title, score, description } = req.body;

        try {
            await postService.updatePost(postId, title, score, description);
            return res.status(200).json({ message: "Updated post", data: postId });
        } catch (err) {
            handleServiceError(err, res);
        }
    }
);

/**
 * Delete an existing post; must be post owner
 * Path Parameter
 *      :id {string} - The id of the post being deleted
 * Response
 *      200 - Deleted post
 *          postId {string}
 *      400 - Post ${id} not found
 */
postRouter.delete("/:id", authMiddleware.postOwnerAuthenticate(), async (req, res) => {
    const postId = req.params.id;

    try {
        await postService.deletePost(postId);
        return res.status(200).json({ message: "Deleted post", data: postId });
    } catch (err) {
        handleServiceError(err, res);
    }
});

/**
 * Like or dislike an existing post
 * Path Param
 *      :id {string} - The id of the post being liked/disliked
 * Request Body
 *      like {string} - Whether the user is liking/disliking the post
 * Response
 *      200 - Liked post ${id} successfully
 *      200 - Disliked post ${id} successfully
 *      400 - Post ${id} not found
 *      400 - You already liked post ${postID}
 *      400 - You already disliked post ${postID}
 */
postRouter.patch("/:id/likes", authMiddleware.authenticate(), postMiddleware.validateLike(), async (req, res) => {
    //TODO check song title exists in API
    const { id } = req.params;
    const { like } = req.body;

    try {
        await postService.checkLike(like, id, res.locals.user.itemID);
        if (like == 1) {
            res.status(200).json({
                message: `Liked post ${id} successfully`
            });
        }
        else {
            res.status(200).json({
                message: `Disliked post ${id} successfully`
            });
        }
    } catch (err) {
        handleServiceError(err, res);
    }
});

module.exports = {
    postRouter
};