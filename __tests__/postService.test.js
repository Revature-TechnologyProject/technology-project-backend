const { createPost, createReply, checkLike } = require("../src/services/postService");
const postDAO = require("../src/repository/postDAO");

jest.mock('../src/repository/postDAO');
let mockDatabase = [];
const mockPost1 = {
    class: "post",
    itemID: "e7b1998e-77d3-4cad-9955-f20135d840d0",
    postedBy: "95db201c-35bb-47d6-8634-8701a01f496a",
    description: "Hello world",
    score: 50,
    title: "Title",
    replies: [],
    likedBy: []
};
const mockPost2 = {
    class: "post",
    itemID: "29ee2056-c74e-4537-ac95-6234a2506426",
    postedBy: "6d737a3b-d543-459b-aca6-d1f04952bf30",
    description: "This is a great song",
    score: 100,
    title: "Title",
    replies: [],
    likedBy: []
};

beforeAll(() => {
    // Mock postDAO here
    postDAO.sendPost.mockImplementation(async (post) => {
        mockDatabase.push(post);
        return {
            $metadata: {
                httpStatusCode: 200
            }
        };
    });
    postDAO.getPost.mockImplementation(async (id) => {
        for (let i = 0; i < mockDatabase.length; i++){
            if (mockDatabase[i].itemID == id){
                return {
                    $metadata: {
                        httpStatusCode: 200
                    },
                    Item: mockPost1
                };
            }
        }
    });
    postDAO.sendReply.mockImplementation(async (reply, id) => {
        const post = await postDAO.getPost(id);
        post.Item.replies.push(reply);
        return {
            $metadata: {
                httpStatusCode: 200
            }
        };
    });
    postDAO.sendLike.mockImplementation(async (like, id) =>{
        const post = await postDAO.getPost(id);
        post.Item.likedBy.push(like);
        for (let i = 0; i < mockDatabase.length; i++){
            if (mockDatabase[i].itemID == post.Item.itemID){
                mockDatabase[i].likedBy = post.Item.likedBy;
                break;
            }
        }
        return {
            $metadata: {
                httpStatusCode: 200
            }
        };
    });
    postDAO.removeLike.mockImplementation(async (index, id) => {
        const post = await postDAO.getPost(id);
        post.Item.likedBy.splice(index, 1);
        for (let i = 0; i < mockDatabase.length; i++){
            if (mockDatabase[i].itemID == post.Item.itemID){
                mockDatabase[i].likedBy = post.Item.likedBy;
                break;
            }
        }
        return {
            $metadata: {
                httpStatusCode: 200
            }
        };
    });
});

beforeEach(() => {
    // Reset database
    mockDatabase = [];
    mockDatabase.push(mockPost1);
    mockDatabase.push(mockPost2);
    postDAO.sendPost.mockClear();
    postDAO.sendReply.mockClear();
    postDAO.getPost.mockClear();
    postDAO.sendLike.mockClear();
    postDAO.removeLike.mockClear();
});

describe('createPost test', () => {
    it('Successful post creation', async () => {
        const id = "95db201c-35bb-47d6-8634-8701a01f496a";
        const text = "Decent song";
        const score = 69;
        const title = "Hello";

        await createPost(id, text, score, title);
        let added = false;
        mockDatabase.forEach((post) => {
            if (post.class == "post" && post.postedBy == id && post.description == text && post.score == score && post.title == title) {
                added = true;
            }
        });
        expect(added).toBeTruthy();
    });
});

describe('createReply test', () => {
    it('Successful reply creation', async () => {
        const userID = "6d737a3b-d543-459b-aca6-d1f04952bf30";
        const text = "I agree";
        const id = mockPost1.itemID;

        await createReply(userID, text, id);
        let added = false;
        mockDatabase.forEach((post) => {
            if(post.itemID == id && post.replies.length > 0){
                added = true;
            }
        });
        expect(added).toBeTruthy();
    });
});

describe('checkLike test', () => {
    it('Successful like post', async () => {
        const id = mockPost1.itemID;
        const like = 1;
        const userID = "f162b963-6b4e-4033-9159-2e0c13d78419";

        await checkLike(like, id, userID);
        let added = false;
        mockDatabase.forEach((post) => {
            if (post.itemID == id){
                for (const i of post.likedBy){
                    if(i.userID == userID && i.like == 1){
                        added = true;
                    }
                }
            }
        });
        expect(added).toBeTruthy();
    });
    it('Successful dislike post on post that was already liked', async () => {
        const id = mockPost1.itemID;
        const like = -1;
        const userID = "f162b963-6b4e-4033-9159-2e0c13d78419";

        await checkLike(like, id, userID);
        let added = false;
        mockDatabase.forEach((post) => {
            if (post.itemID == id){
                for (const i of post.likedBy){
                    if (i.userID == userID && i.like == -1){
                        added = true;
                    }
                    if (i.userID == userID && i.like == 1){
                        added = false;
                        return;
                    }
                }
            }
        });
        expect(added).toBeTruthy();
    });
});