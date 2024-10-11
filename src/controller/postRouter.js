const express = require('express');
const postService = require('../services/postService');
const { handleServiceError } = require('../utilities/routerUtilities');
const { authenticate } = require("../middleware/authMiddleware");
const postMiddleware = require('../middleware/postMiddleware');

const postRouter = express.Router();


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
        await postService.createReply(res.locals.user.itemID, req.body.text, req.params.id);
        res.status(200).json({
            message: `Replied to ${req.params.id} successfully`
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