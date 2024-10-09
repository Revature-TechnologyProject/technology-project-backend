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
            //Can't update, can only flag if not an admin or the poster
            const {flag} = req.body;
            if (flag === undefined) {
                return res.status(400).json({message: "flag must be provided in body"});
            }
            if (typeof(flag) !== "number" || (flag < 0 || flag > 1)) {
                return res.status(400).json({message: "flag must be a number (0 or 1)"});
            }
            await updatePostFlag(id, flag);
            return res.status(200).json({id, updated: {isFlagged: flag}})
        } else {
            // Only get updatable fields from the body
            const {description, title, score, flag} = req.body;
            if (!description && !title && !score && !flag) {
                return res.status(400).json({message: "No updatable attributes provided. Must provide description, title, flag, or score in body"});
            }
            if (score && typeof(score) !== "number") {
                return res.status(400).json({message: "provided score must be of type number"});
            }
            if (flag !== undefined && post.postedBy === user.username) {
                flag = undefined; // Users and admins cannot flag/unflag their own post
            }
            if (flag !== undefined && (typeof(flag) !== "number" || (flag > 1 || flag < 0))) {
                return res.status(400).json({message: "provided flag must be a number (0 or 1)"});
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