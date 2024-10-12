const jwt = require("jsonwebtoken");
const postService = require("../services/postService");


const authenticate = (req, res, next) => {
    const token = getToken(req);
    if (!token) {
        return res.status(401).json("Unauthorized Access");
    }
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        res.locals.user = user;
        next();
    } catch (err) {
        return res.status(401).json("Unauthorized Access, try relogging");
    }
}

const postOwnerOrAdminAuthenticate = async (req, res, next) => {
    const token = getToken(req);
    if (!token) {
        return res.status(401).json("Unauthorized Access");
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        const { postId } = req.params;
        const userId = user.itemID;
        const { role } = user;

        const foundPost = await postService.getPostById(postId);
        if (!(foundPost.postedBy === userId || role === "admin")) {
            return res.status(401).json("Unauthorized Access - Wrong User or Not Admin");
        }

        res.locals.user = user;
        next();
    } catch (err) {
        return res.status(401).json("Unauthorized Access, try relogging");
    }
}

const replyOwnerOrAdminAuthenticate = async (req, res, next) => {
    const token = getToken(req);
    if (!token) {
        return res.status(401).json("Unauthorized Access");
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        const { postId, replyId } = req.params;
        const userId = user.itemID;
        const { role } = user;

        const foundReply = await postService.getReplyOfPost(postId, replyId);
        if (!(foundReply.postedBy === userId || role === "admin")) {
            return res.status(400).json({ message: "Unauthorized access - wrong user or not admin" });
        }

        res.locals.user = user;
        next();
    } catch (err) {
        return res.status(401).json("Unauthorized Access, try relogging");
    }
}

const adminAuthenticate = (req, res, next) => {
    const token = getToken(req);
    if (!token) {
        return res.status(401).json("Unauthorized Access");
    }
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        if (user.role !== "admin") {
            return res.status(401).json({message: "Privilege too low"});
        }
        res.locals.user = user;
        next();
    } catch (err) {
        return res.status(401).json("Unauthorized Access, try relogging");
    }
}

function getToken(req) {
    const token = req.headers?.authorization && req.headers.authorization.split(" ")[1];
    return token;
}

module.exports = { authenticate, postOwnerOrAdminAuthenticate, replyOwnerOrAdminAuthenticate, adminAuthenticate };