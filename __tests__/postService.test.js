const postService = require("../src/services/postService");
const postDAO = require("../src/repository/postDAO");
const { CLASS_POST } = require("../src/utilities/dynamoUtilities");

jest.mock('../src/repository/postDAO');
let mockDatabase = [];
const mockPost1 = {
    class: CLASS_POST,
    itemID: "e7b1998e-77d3-4cad-9955-f20135d840d0",
    postedBy: "user_1",
    description: "Hello world",
    score: 50,
    title: "Title",
    replies: []
};
const mockPost2 = {
    class: CLASS_POST,
    itemID: "29ee2056-c74e-4537-ac95-6234a2506426",
    postedBy: "user_2",
    description: "This is a great song",
    score: 100,
    title: "Title",
    replies: []
};
const mockReply1 = {
    itemID: "f2194fa8-afab-4ed0-9904-2d5af3142aff",
    postedBy: "user_2",
    description: "Hello there"
}

beforeAll(() => {
    // Mock postDAO here
    postDAO.sendPost.mockImplementation(async (post) => {
        mockDatabase.push(post);
        return {
            $metadata: {
                httpStatusCode: 201
            }
        };
    });
    postDAO.getPost.mockImplementation(async (postId) => {
        for (let i = 0; i < mockDatabase.length; i++){
            if (mockDatabase[i].itemID === postId){
                return {
                    $metadata: {
                        httpStatusCode: 200
                    },
                    Item: mockDatabase[i]
                };
            }
        }
        return {
            $metadata: {
                httpStatusCode: 200
            },
        };
    });
    postDAO.sendReply.mockImplementation(async (postId, reply) => {
        for (let i = 0; i < mockDatabase.length; i++){
            if (mockDatabase[i].itemID === postId){
                mockDatabase[i].replies.push(reply[0]);
                return {
                    $metadata: {
                        httpStatusCode: 201
                    }
                };
            }
        }
    });
    postDAO.updateReplies.mockImplementation(async (postId, replies) => {
        for (let i = 0; i < mockDatabase.length; i++) {
            if (mockDatabase[i].itemID === postId) {
                mockDatabase[i].replies = replies;
                return {
                    $metadata: {
                        httpStatusCode: 200
                    }
                };
            }
        }
    }); 
});

beforeEach(() => {
    // Reset database
    mockDatabase = [];
    mockDatabase.push(mockPost1);
    mockDatabase.push(mockPost2);
    postDAO.sendPost.mockClear();
    postDAO.getPost.mockClear();
    postDAO.sendReply.mockClear();
    postDAO.updateReplies.mockClear();
});

describe('createPost test', () => {
    
    it('Successful post creation', async () => {
        const userId = "user_3";
        const text = "Decent song";
        const score = 69;
        const title = "Hello";

        const response = await postService.createPost(userId, text, score, title);
        let added = false;
        mockDatabase.forEach((post) => {
            if (post.class === CLASS_POST && post.postedBy === userId && post.description === text && post.score === score && post.title === title && post.replies.length === 0) {
                added = true;
            }
        });
        expect(added).toBeTruthy();
    });
});

describe('createReply test', () => {
    
    it('Successful reply creation', async () => {
        const userId = "user_1";
        const postId = "e7b1998e-77d3-4cad-9955-f20135d840d0";
        const text = "I agree";

        const response = await postService.createReply(userId, postId, text);
        let added = false;
        mockDatabase.forEach((post) => {
            if(post.itemID === postId && post.replies.length === 1) {
                added = true;
            }
        });
        expect(added).toBeTruthy();
    });
});

describe('Delete reply tests', () => {

    it('Successful reply deletion', async () => {
        mockDatabase[0].replies.push(mockReply1);

        const postId = "e7b1998e-77d3-4cad-9955-f20135d840d0";
        const replyId = "f2194fa8-afab-4ed0-9904-2d5af3142aff";

        await postService.deleteReply(postId, replyId);
        let isDeleted = true;
        mockDatabase.forEach((post) => {
            if (post.itemID === postId) {
                post.replies.forEach((reply) => {
                    if (reply.itemID === replyId) {
                        isDeleted = false;
                    }
                })
            }
        });
        expect(isDeleted).toBeTruthy();
    });

    it('Throws error when post is not found', async () => {
        const postId = "invalid_postId";
        const replyId = "f2194fa8-afab-4ed0-9904-2d5af3142aff";

        let error;
        try {
            await postService.deleteReply(postId, replyId);
        } catch(err) {
            error = err;
        }
        expect(error.status).toEqual(400);
    });

    it('Throws error when reply is not found', async () => {
        const postId = "e7b1998e-77d3-4cad-9955-f20135d840d0";
        const replyId = "invalid_replyId";

        let error;
        try {
            await postService.deleteReply(postId, replyId);
        } catch(err) {
            error = err;
        }
        expect(error.status).toEqual(400);
    });
});