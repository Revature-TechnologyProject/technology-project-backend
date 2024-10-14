const { createPost, createReply, getPostById, updatePost, deletePost } = require("../src/services/postService");
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
        for (let i = 0; i < mockDatabase.length; i++) {
            if (mockDatabase[i].itemID == id) {
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
            }
        };
    });
    postDAO.sendReply.mockImplementation(async (reply, id) => {
        for (let i = 0; i < mockDatabase.length; i++) {
            if (mockDatabase[i].itemID == id) {
                mockDatabase[i].replies.push(reply[0]);
                return {
                    $metadata: {
                        httpStatusCode: 200
                    }
                };
            }
        }
    });
    postDAO.updatePost.mockImplementation(async (post) => {
        for (let i = 0; i < mockDatabase.length; i++) {
            if (mockDatabase[i].itemID == post.itemID) {
                mockDatabase[i] = post;
                return {
                    $metadata: {
                        httpStatusCode: 200
                    }
                };
            }
        }
    });
    postDAO.deletePost.mockImplementation(async (id) => {
        for (let i = 0; i < mockDatabase.length; i++) {
            if (mockDatabase[i].itemID == id) {
                mockDatabase.splice(i, 1);
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
    mockDatabase.push(structuredClone(mockPost1));
    mockDatabase.push(structuredClone(mockPost2));
    postDAO.sendPost.mockClear();
    postDAO.getPost.mockClear();
    postDAO.sendReply.mockClear();
    postDAO.updatePost.mockClear();
    postDAO.deletePost.mockClear();
});

describe('createPost test', () => {
    it('Successful post creation', async () => {
        const username = "Sam";
        const text = "Decent song";
        const score = 69;
        const title = "Hello";

        const response = await createPost(username, text, score, title);
        let added = false;
        mockDatabase.forEach((post) => {
            if (post.class == "post" && post.postedBy == username && post.description == text && post.score == score && post.title == title && post.replies.length == 0) {
                added = true;
            }
        });
        expect(added).toBeTruthy();
    });
});

describe('createReply test', () => {
    it('Successful reply creation', async () => {
        const username = "Mac";
        const text = "I agree";
        const id = "e7b1998e-77d3-4cad-9955-f20135d840d0";

        const response = await createReply(username, text, id);
        let added = false;
        mockDatabase.forEach((post) => {
            if (post.itemID == id && post.replies.length > 0) {
                added = true;
            }
        });
        expect(added).toBeTruthy();
    });
});

describe('getPostById', () => {
    it('Successful get post', async () => {
        const id = mockPost1.itemID;
        const expectedDescription = mockPost1.description;

        const post = await getPostById(id);

        expect(post.itemID).toEqual(id);
        expect(post.description).toEqual(expectedDescription);
    });

    it('Throws if post not found', async () => {
        const id = "FakeID";
        let error;
        const expectedStatus = 400;

        try {
            await getPostById(id);
        }
        catch (err) {
            error = err;
        }

        expect(error?.status).toEqual(expectedStatus);
    });
})

describe('updatePost test', () => {
    it('Successful update post', async () => {
        const id = mockPost1.itemID;
        const title = "Different Title";
        const score = 28;
        const description = "New description";

        await updatePost(id, title, score, description);
        const post = (await postDAO.getPost(id)).Item;

        expect(post.title).toEqual(title);
        expect(post.score).toEqual(score);
        expect(post.description).toEqual(description);
    });

    it('Update only the title', async () => {
        const id = mockPost1.itemID;
        const title = "Another Different Title";
        const score = undefined;
        const description = undefined;
        const expectedScore = mockPost1.score;
        const expectedDescription = mockPost1.description;

        await updatePost(id, title, score, description);
        const post = (await postDAO.getPost(id)).Item;

        expect(post.title).toEqual(title);
        expect(post.score).toEqual(expectedScore);
        expect(post.description).toEqual(expectedDescription);
    });
});

describe('deletePost test', () => {
    it('Successful delete post', async () => {
        const id = mockPost1.itemID;
        const expectedStatus = 200;
        const expectedPosts = mockDatabase.length - 1;

        await deletePost(id);
        const response = (await postDAO.getPost(id));

        expect(response.Item).toBeFalsy();
        expect(mockDatabase.length).toEqual(expectedPosts);
    });
});