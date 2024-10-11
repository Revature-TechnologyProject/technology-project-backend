const uuid = require("uuid");
const { throwIfError } = require('../utilities/dynamoUtilities');
const postDAO = require("../repository/postDAO");


async function createPost(username, description, score, title){
    const post = {
        class: "post",
        itemID: uuid.v4(),
        postedBy: username,
        description,
        score,
        title,
        isFlagged: 0
    }
    const result = await postDAO.sendPost(post);
    throwIfError(result);
    delete (post.class);
    return post;
}

async function updatePost(id, post, attributes) {
    const {description, title, score, isFlagged} = attributes;
    const error = {status: 400, message: ""};
    if (isFlagged !== undefined && (typeof(isFlagged) !== "number" || (isFlagged > 1 || isFlagged < 0))) {
        error.message = "provided flag must be a number (0 or 1)";
        throw error
    }
    if (description === undefined && title === undefined && score === undefined && isFlagged === undefined) {
        error.message = "No updatable attributes provided. Must provide description, title, flag, or score in body (flag is not valid if you are the poster)";
        throw error
    }
    if (score !== undefined && typeof(score) !== "number") {
        error.message = "provided score must be of type number";
        throw error;
    }
    if (description !== undefined && typeof(description) !== "string") {
        error.message = "provided description must be of type string";
        throw error;
    }
    if (title !== undefined && typeof(title) !== "string") {
        error.message = "provided title must be of type string";
        throw error;
    }

    Object.keys(attributes).forEach((key) => {
        if (attributes[key] === undefined) {
            attributes[key] = post[key];
        }
    });
    const result = await postDAO.updatePost(id, attributes);
    throwIfError(result);
    return attributes;
}

async function getPost(id) {
    const post = await postDAO.getPost(id);
    if (!post) {
        throw {status: 400, message: `Post not found with id: ${id}`};
    }
    return post;
}

async function updatePostFlag(id, flag) {
    const error = {status: 400, message: ""};
    //Can't update, can only flag if not an admin or the poster
    if (flag === undefined) {
        error.message = "flag must be provided in body";
        throw error;
    }
    if ((typeof(flag) !== "number" || (flag > 1 || flag < 0))) {
        error.message = "provided flag must be a number (0 or 1)";
        throw error;
    }
    const result = await postDAO.updatePostFlag(id, flag);
    throwIfError(result);
}

async function getFlaggedPost(isFlagged) {
    if (isFlagged > 1 || isFlagged < 0) {
        throw {status: 400, message: "isFlagged must be 0 or 1"};
    }
    const result = await postDAO.getFlaggedPost(isFlagged);
    throwIfError(result);
    return result.Items;
}

module.exports = {
    createPost,
    updatePost,
    getPost,
    updatePostFlag,
    getFlaggedPost
};