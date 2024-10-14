const { PutCommand, GetCommand, UpdateCommand, QueryCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { TableName, runCommand, flaggedIndex, CLASS_POST } = require('../utilities/dynamoUtilities');

async function sendPost(Item){
    const command = new PutCommand({
        TableName: TableName,
        Item
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

async function updatePost(id, attributes) {
    const command = new UpdateCommand({
        TableName,
        Key: {class: CLASS_POST, itemID: id},
        UpdateExpression: "SET #description = :description, #score = :score, #title = :title, #isFlagged = :isFlagged",
        ExpressionAttributeNames: {
            "#description": "description",
            "#score": "score",
            "#title": "title",
            "#isFlagged": "isFlagged" 
        },
        ExpressionAttributeValues: {
            ":description": attributes.description,
            ":title": attributes.title,
            ":score": attributes.score,
            ":isFlagged": attributes.isFlagged
        }
    })
    return await runCommand(command);
}

async function getPost(id) {
    const command = new GetCommand({
        TableName,
        Key: {class: CLASS_POST, itemID: id}
    });
    return await runCommand(command);
}

async function updatePostFlag(id, flag) {
    const command = new UpdateCommand({
        TableName,
        Key: {class: CLASS_POST, itemID: id},
        UpdateExpression: "SET #isFlagged = :isFlagged",
        ExpressionAttributeNames: {
            "#isFlagged": "isFlagged" 
        },
        ExpressionAttributeValues: {
            ":isFlagged": flag
        }
    })
    return await runCommand(command);
}

async function getFlaggedPost(isFlagged) {
    const command = new QueryCommand({
        TableName,
        IndexName: "class-isFlagged-index",
        KeyConditionExpression: "#class = :class AND #isFlagged = :isFlagged",
        ExpressionAttributeNames: {
            "#class": "class",
            "#isFlagged": "isFlagged"
        },
        ExpressionAttributeValues: {
            ":isFlagged": isFlagged,
            ":class": CLASS_POST
        }
    })
    const result = await runCommand(command);
    return result
}

module.exports = {
    sendPost,
    updatePost,
    getPost,
    updatePostFlag,
    getFlaggedPost,
    scanPosts,
    sendReply,
    sendLike,
    removeLike,
};