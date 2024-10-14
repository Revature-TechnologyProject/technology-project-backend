const { PutCommand, ScanCommand, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { TableName, runCommand, CLASS_POST } = require('../utilities/dynamoUtilities');

async function sendPost(post){
    const command = new PutCommand({
        TableName,
        Item: post
    });
    return await runCommand(command);
}

async function scanPosts() {
    const command = new ScanCommand({
        TableName,
        FilterExpression: "#class = :class",
        ExpressionAttributeNames: {
            "#class": "class"
        },
        ExpressionAttributeValues: {
            ":class": CLASS_POST
        }
    });
    const response = await runCommand(command);
    return response;
}

async function sendReply(reply, id){
    const command = new UpdateCommand({
        TableName,
        Key: {"class": CLASS_POST, "itemID": id},
        ExpressionAttributeValues: {
            ":reply": [reply]
        },
        UpdateExpression: "SET replies = list_append(replies, :reply)",
        ReturnValues: "UPDATED_NEW"
    });
    return await runCommand(command);
}

async function getPost(id) {
    const command = new GetCommand({
        TableName,
        Key: {class: CLASS_POST, itemID: id}
    });
    return await runCommand(command);
}

async function sendLike(like, id){
    const command = new UpdateCommand({
        TableName,
        Key: {"class": CLASS_POST, "itemID": id},
        ExpressionAttributeValues: {
            ":r": [like]
        },
        UpdateExpression: "SET likedBy = list_append(likedBy, :r)",
        ReturnValues: "UPDATED_NEW"
    });
    return await runCommand(command);
}

async function removeLike(index, id){
    const command = new UpdateCommand({
        TableName,
        Key: {"class": CLASS_POST, "itemID": id},
        UpdateExpression: "REMOVE likedBy["+index+"]",
        ReturnValues: "UPDATED_NEW"
    });
    return await runCommand(command);
}

module.exports = {
    sendPost,
    scanPosts,
    sendReply,
    getPost,
    sendLike,
    removeLike
};