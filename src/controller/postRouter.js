const express = require('express');
const { createPost, createReply, seePosts, updatePost, deletePost } = require('../services/postService');
const { handleServiceError } = require('../utilities/routerUtilities');
const { authenticate, postOwnerAuthenticate } = require("../middleware/authMiddleware");
const { validateTextBody, validateScore, validateTitle } = require('../middleware/postMiddleware');


const postRouter = express.Router();

postRouter.post("/", authenticate(), validateTitle(), validateTextBody(), validateScore(), async (req, res) => {
    //TODO check song title exists in API
    const { text, score, title } = req.body;

    try {
        await createPost(res.locals.user.username, text, score, title);
        res.status(200).json({
            message: "Post successfully created"
        });
    } catch (err) {
        handleServiceError(err, res);
    }
});

postRouter.get("/", async (req, res) => {
    //TODO check song title exists in API
    try {
        const posts = await seePosts();
        res.status(200).json({
            Posts: posts
        });
    } catch (err) {
        handleServiceError(err, res);
    }
});

postRouter.patch("/replies", authenticate(), validateTextBody(), async (req, res) => {
    //TODO check song title exists in API
    const { text, id } = req.body;

    try {
        await createReply(res.locals.user.username, text, id);
        res.status(200).json({
            message: "Reply successfully created"
        });
    } catch (err) {
        handleServiceError(err, res);
    }
});

postRouter.patch("/:postId", postOwnerAuthenticate(), validateTitle(false), validateScore(false), validateTextBody(false),
    async (req, res) => {
        const postId = req.params.postId;
        const { title, score, description } = req.body;

        try {
            await updatePost(postId, title, score, description);
            return res.status(200).json({ message: "Updated post", data: postId });
        } catch (err) {
            handleServiceError(err, res);
        }
    }
);

postRouter.delete("/:postId", postOwnerAuthenticate(), async (req, res) => {
    const postId = req.params.postId;

    try {
        await deletePost(postId);
        return res.status(200).json({ message: "Deleted post", data: postId });
    } catch (err) {
        handleServiceError(err, res);
    }
});

module.exports = {
    postRouter
};