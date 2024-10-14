const { throwIfError } = require('../utilities/dynamoUtilities');
const postDAO = require("../repository/postDAO");
const uuid = require("uuid");


async function createPost(userID, text, score, title, tags){
    const post = {class: "post", itemID: uuid.v4(), postedBy: userID, description: text, score, title, replies: [], likedBy: [], tags: tags ? tags.split(',') : []};
    const data = await postDAO.sendPost(post);
    throwIfError(data);
    return post;
}

async function seePosts(){
    const posts = await postDAO.scanPosts();
    throwIfError(posts);
    return posts.Items;
}

async function createReply(userID, text, id){
async function createReply(userID, text, id){
    const post = await postDAO.getPost(id);
    if (!post.Item) {
        throw {status: 400, message: `Post ${id} doesn't exist`};
        throw {status: 400, message: `Post ${id} doesn't exist`};
    }
    const reply = {postedBy: userID, description: text, itemID: uuid.v4()};
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
    createReply,
    seePosts,
    checkLike,
    checkTags
};