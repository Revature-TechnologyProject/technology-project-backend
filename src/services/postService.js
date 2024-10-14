const uuid = require("uuid");
const { throwIfError, CLASS_POST } = require('../utilities/dynamoUtilities');
const postDAO = require("../repository/postDAO");

const createPost = async (userId, text, score, title) => {
    const post = { class: CLASS_POST, itemID: uuid.v4(), postedBy: userId, description: text, score, title, replies: [], likedBy: [] };
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

const createReply = async (userId, postId, text) => {
    const post = await postDAO.getPost(postId);
    if (!post.Item) {
        throw { status: 400, message: `Post ${postId} doesn't exist` };
    }
    const reply = { itemID: uuid.v4(), postedBy: userId, description: text };
    const data = await postDAO.sendReply(postId, reply);
    throwIfError(data);
    return reply;
}

const getPostById = async (postId) => {
    const getPostResult = await postDAO.getPost(postId);
    throwIfError(getPostResult);
    const foundPost = getPostResult.Item;
    if (!foundPost) {
        throw {
            status: 400,
            message: "Post not found"
        }
    }
    return foundPost;
}

const seePosts = async () => {
    const posts = await postDAO.scanPosts();
    throwIfError(posts);
    return posts.Items;
}

const getReplyOfPost = async (postId, replyId) => {
    const repliesOfPost = await getRepliesOfPost(postId);
    const foundReply = repliesOfPost.find((reply) => reply.itemID === replyId);
    if (!foundReply) {
        throw { status: 400, message: "That reply doesn't exist" }
    }
    return foundReply;
}

const getRepliesOfPost = async (postId) => {
    const foundPost = await getPostById(postId);
    return foundPost.replies;
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

const deletePost = async (postId) => {
    await getPostById(postId);

    const deleteResult = await postDAO.deletePost(postId);
    throwIfError(deleteResult);
}

const deleteReply = async (postId, replyId) => {
    const repliesOfPost = await getRepliesOfPost(postId);
    
    const index = repliesOfPost.findIndex((reply) => reply.itemID === replyId);
    if (index === -1) {
        throw { status: 400, message: "That reply doesn't exist" }
    }
    
    const newReplies = repliesOfPost.filter((reply) => reply.itemID !== replyId); // tried using splice() but for some reason does not work
    const data = await postDAO.updateReplies(postId, newReplies);
    throwIfError(data);
}

module.exports = {
    createPost,
    updatePost,
    getPost,
    updatePostFlag,
    getFlaggedPost,
    createReply,
    getPostById,
    seePosts,
    getReplyOfPost,
    checkLike,
    deletePost,
    deleteReply
};