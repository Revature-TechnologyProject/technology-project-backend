const uuid = require("uuid");
const { throwIfError } = require('../utilities/dynamoUtilities');
const postDAO = require("../repository/postDAO");

async function createPost(userID, description, score, title, tags){
    const post = {class: "post", itemID: uuid.v4(), postedBy: userID, description, score, title, replies: [], likedBy: [], tags: tags ? tags.split(',') : [], isFlagged: 0};
    const data = await postDAO.sendPost(post);
    throwIfError(data);
    delete(post.class);
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
    if (!post.Item) {
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

async function seePosts(){
    const posts = await postDAO.scanPosts();
    throwIfError(posts);
    return posts.Items;
}

async function createReply(userID, text, id){
    const post = await postDAO.getPost(id);
    if (!post.Item) {
        throw {status: 400, message: `Post ${id} doesn't exist`};
    }
    const reply = {postedBy: userID, description: text, itemID: uuid.v4()};
    const data = await postDAO.sendReply(reply, id);
    throwIfError(data);
    return reply;
}

async function checkLike(like, postID, userID){
    const userLike = {userID, like};
    const post = await postDAO.getPost(postID);
    if (!post.Item) {
        throw {status: 400, message: `Post ${postID} doesn't exist`};
    }
    const likeList = post.Item.likedBy;
    for (let i = 0; i < likeList.length; i++){
        if (likeList[i].userID == userID){
            if (likeList[i].like == like){
                if (like == 1){
                    throw {status: 400, message: `You already liked post ${postID}`};
                }
                throw {status: 400, message: `You already disliked post ${postID}`};
            }
            //Remember to have frontend update like/dislike because you changed your mind
            const data = await postDAO.removeLike(i, postID);
            throwIfError(data);
            break;
        }
    }
    const postData = await postDAO.sendLike(userLike, postID);
    throwIfError(postData);
    return postData;
}

async function checkTags(tags, inclusive){
    const posts = await postDAO.scanPosts();
    throwIfError(posts);
    if (!tags){
        return posts.Items;
    }
    tags = tags.split(',');
    const postSet = new Set();
    if (inclusive == 1){
        for (const post of posts.Items){
            for (const i of tags){
                if (post.tags.includes(i)){
                    postSet.add(post);
                    break;
                }
            }
        }
    }
    else {
        for (const post of posts.Items){
            let should = true;
            for (const i of tags){
                if (!post.tags.includes(i)){
                    should = false;
                    break;
                }
            }
            if (should){
                postSet.add(post);
            }
        }
    }
    return [...postSet];
}

module.exports = {
    createPost,
    updatePost,
    getPost,
    updatePostFlag,
    getFlaggedPost,
    createReply,
    seePosts,
    checkLike,
    checkTags
};