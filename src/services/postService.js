const { throwIfError, CLASS_POST } = require('../utilities/dynamoUtilities');
const postDAO = require("../repository/postDAO");
const uuid = require("uuid");

const createPost = async (userId, text, score, title) => {
    const post = { class: CLASS_POST, itemID: uuid.v4(), postedBy: userId, description: text, score, title, replies: [], likedBy: [] };
    const data = await postDAO.sendPost(post);
    throwIfError(data);
    return post;
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
    createReply,
    getPostById,
    seePosts,
    getReplyOfPost,
    checkLike,
    deletePost,
    deleteReply
};