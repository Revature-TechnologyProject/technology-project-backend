const jwt = require("jsonwebtoken");
const postService = require("../services/postService");
const userService = require("../services/userService");

const authenticate = () => {
    return isAuthorized(() => true, "");
};

const postOwnerOrAdminAuthenticate = () => {
    return isAuthorized(async (user, req) => {
        const userId = user.itemID;
        const { postId } = req.params;

        const foundPost = await postService.getPostById(postId);
        return foundPost.postedBy === userId || user.role === "admin";
    }, "Unauthorized access - Wrong User or Not Admin");
}

const accountOwnerAuthenticate = () => {
    return isAuthorized((user, req) => {
        const userId = req.params.userId;
        return userId === user.itemID;
    }, "Unauthorized Access - Wrong User");
};

const postOwnerAuthenticate = () => {
    return isAuthorized(async (user, req) => {
        const { postId } = req.params;
        const post = await postService.getPostById(postId);
        const postOwner = await userService.getUserById(post.postedBy);

        return postOwner.itemID === user.itemID;
    }, "Unauthorized Access - Wrong User");
};

const adminAuthenticate = () => {
    return isAuthorized((user) => user.role === "admin", "Privilege too low");
};

function isAuthorized(isAuthorizedCalledback, onFailMessage) {
    return async (req, res, next) => {
        const token = getToken(req);
        if (!token) {
            return res.status(401).json("Unauthorized Access");
        }

        try {
            const user = jwt.verify(token, process.env.JWT_SECRET);
            const isAuthorized = await isAuthorizedCalledback(user, req);
            if (!isAuthorized) {
                return res.status(401).json({ message: onFailMessage });
            }
            res.locals.user = user;
            next();
        } catch (err) {
            console.log(err);
            return res.status(401).json("Unauthorized Access, try relogging");
        }
    };
}

function getToken(req) {
    const token = req.headers?.authorization && req.headers.authorization.split(" ")[1];
    return token;
}

module.exports = {
    authenticate,
    postOwnerOrAdminAuthenticate,
    accountOwnerAuthenticate,
    postOwnerAuthenticate,
    adminAuthenticate
};
