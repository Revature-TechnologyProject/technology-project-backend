const { throwIfError, CLASS_POST } = require('../utilities/dynamoUtilities');
const postDAO = require("../repository/postDAO");

const uuid = require("uuid");

const createPost = async (userID, text, score, title) => {
    const post = { class: CLASS_POST, itemID: uuid.v4(), postedBy: userID, description: text, score, title, replies: [], likedBy: [] };
    const data = await postDAO.sendPost(post);
    throwIfError(data);
    return post;
}

const createReply = async (userID, text, id) => {
    await getPostById(id);
    const reply = { postedBy: userID, description: text, itemID: uuid.v4() };
    const data = await postDAO.sendReply(reply, id);
    throwIfError(data);
    return reply;
}

const getPostById = async (id) => {
    const getPostResult = await postDAO.getPost(id);
    throwIfError(getPostResult);
    const foundPost = getPostResult.Item;
    if (!foundPost) {
        throw {
            status: 400,
            message: `Post ${id} not found`
        }
    }

    return foundPost;
}

const seePosts = async () => {
    const posts = await postDAO.scanPosts();
    throwIfError(posts);
    return posts.Items;
}

const updatePost = async (id, title, score, description) => {
    const post = await getPostById(id);
    post.title = title ? title : post.title;
    post.score = score ? score : post.score;
    post.description = description ? description : post.description;

    const updateResult = await postDAO.updatePost(post);
    throwIfError(updateResult);
};

const deletePost = async (id) => {
    await getPostById(id);

    const deleteResult = await postDAO.deletePost(id);
    throwIfError(deleteResult);
}

const checkLike = async (like, postID, userID) => {
    const userLike = { userID, like };
    const post = await getPostById(postID);
    const likeList = post.likedBy;
    for (let i = 0; i < likeList.length; i++) {
        if (likeList[i].userID == userID) {
            if (likeList[i].like == like) {
                if (like == 1) {
                    throw { status: 400, message: `You already liked post ${postID}` };
                }
                throw { status: 400, message: `You already disliked post ${postID}` };
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

module.exports = {
    createPost,
    createReply,
    getPostById,
    seePosts,
    checkLike,
    updatePost,
    deletePost
};