const { throwIfError } = require('../utilities/dynamoUtilities');
const postDAO = require("../repository/postDAO");
const uuid = require("uuid");

async function createPost(userId, text, score, title){
    const post = {class: "post", itemID: uuid.v4(), postedBy: userId, description: text, score, title, replies: []};
    const data = await postDAO.sendPost(post);
    throwIfError(data);
    return post;
}

async function getPostById(id) {
    const getPostResult = await postDAO.getPost(id);
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

async function seePosts(){
    const posts = await postDAO.scanPosts();
    throwIfError(posts);
    return posts.Items;
}

async function createReply(userId, postId, text){
    const post = await postDAO.getPost(postId);
    if (!post.Item) {
        throw {status: 400, message: "That post doesn't exist"};
    }
    const reply = [{ itemID: uuid.v4(), postedBy: userId, description: text }];
    const data = await postDAO.sendReply(postId, reply);
    throwIfError(data);
    return reply;
}

async function getRepliesOfPost(postId) {
    const foundPost = await getPostById(postId);
    return foundPost.replies;
}

async function deletePost(id) {
    await getPostById(id);

    const deleteResult = await postDAO.deletePost(id);
    throwIfError(deleteResult);
}

async function deleteReply(postId, replyId) {
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
    seePosts,
    deletePost,
    deleteReply
};