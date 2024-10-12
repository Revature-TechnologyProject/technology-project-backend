const { PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { TableName, runCommand, CLASS_POST } = require('../utilities/dynamoUtilities');

const sendPost = async (post) => {
    const command = new PutCommand({
        TableName: TableName,
        Item: post
    });
    return await runCommand(command);
}

const sendReply = async (postId, reply) => {
    const command = new UpdateCommand({
        TableName: TableName,
        Key: { "class": CLASS_POST, "itemID": postId },
        ExpressionAttributeValues: {
            ":reply": reply
        },
        UpdateExpression: "SET replies = list_append(replies, :reply)",
        ReturnValues: "UPDATED_NEW"
    });
    return await runCommand(command);
}

const scanPosts = async () => {
    const command = new ScanCommand({
        TableName: TableName,
        FilterExpression: "#class = :class",
        ExpressionAttributeNames: {
            "#class": "class"
        },
        ExpressionAttributeValues: {
            ":class": CLASS_POST
        }
    })
    const response = await runCommand(command);
    return response;
}

const getPost = async (postId) => {
    const command = new GetCommand({
        TableName,
        Key: { class: CLASS_POST, itemID: postId }
    });
    return await runCommand(command);
}

const updateReplies = async (postId, replies) => {
    const command = new UpdateCommand({
        TableName: TableName,
        Key: { "class": CLASS_POST, "itemID": postId },
        UpdateExpression: "SET replies = :replies",
        ExpressionAttributeValues: {
            ":replies": replies
        },
        ReturnValues: "UPDATED_NEW"
    });
    return await runCommand(command);
}

const deletePost = async (postId) => {
    const command = new DeleteCommand({
        TableName,
        Key: { class: CLASS_POST, itemID: postId }
    });
    return await runCommand(command);
}

module.exports = {
    sendPost,
    sendReply,
    scanPosts,
    getPost,
    updateReplies,
    deletePost
};