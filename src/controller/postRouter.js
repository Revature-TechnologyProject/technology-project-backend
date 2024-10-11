const express = require('express');
const { createPost, getPost, updatePost, updatePostFlag, getFlaggedPost } = require('../services/postService');
const { handleServiceError } = require('../utilities/routerUtilities');
const { authenticate } = require("../middleware/authMiddleware");
const { validateTextBody, validateScore } = require('../middleware/postMiddleware');


const postRouter = express.Router();

postRouter.post("/", authenticate, validateTextBody, validateScore, async (req, res) => {
    //TODO check song title exists in API
    try {
        const post = await createPost(res.locals.user.username, req.body.text, req.body.score, req.body.title);
        res.status(200).json(post);
    } catch (err) {
        handleServiceError(err, res);
    }
});

postRouter.patch("/:id", authenticate, async (req, res) => {
    const {id} = req.params;
    try {
        const post = await getPost(id);
        const {user} = res.locals;
        if (user.role === "user" && post.postedBy !== user.username) {
            const {flag} = req.body;
            await updatePostFlag(id, flag);
            return res.status(200).json({id, updated: {isFlagged: flag}})
        } else if (user.role === "admin" || post.postedBy === user.username) {
            // Only get updatable fields from the body
            const {description, title, score} = req.body;
            let {flag} = req.body;
            if (flag !== undefined && post.postedBy === user.username) {
                flag = undefined; // Users cannot flag/unflag their own post
            }
            const updated = await updatePost(id, post, {description: description, title: title, score: score, isFlagged: flag});
            return res.status(200).json({id, updated});
        }
    } catch (err) {
        handleServiceError(err, res);
    }
});

postRouter.get("/:id", async (req, res) => {
    const {id} = req.params;
    try {
        const post = await getPost(id);
        res.status(200).json(post);
    } catch (err) {
        handleServiceError(err, res);
    }
});

postRouter.get("/", async (req, res) => {
    let isFlagged = req.query.isFlagged;
    if (isFlagged !== undefined) {
        isFlagged = parseInt(isFlagged);
        // Since 0 is falsy we need to confirm its not 0
        if (!isFlagged && isFlagged !== 0) {
            return res.status(400).json({message: "isFlagged query must be 0 or 1"})
        }
        try {
            const flaggedPost = await getFlaggedPost(isFlagged);
            return res.status(200).json({flaggedPost});
        } catch (err) {
            handleServiceError(err, res);
        }
    }
});

module.exports = {
    postRouter
};