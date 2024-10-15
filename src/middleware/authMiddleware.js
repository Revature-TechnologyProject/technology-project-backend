const jwt = require("jsonwebtoken");


const authenticate = (req, res, next) => {
    const token = req.headers?.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.status(401).json("Unauthorized Access");
    }
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        res.locals.user = user;
        next();
    } catch {
        return res.status(401).json("Unauthorized Access, try relogging");
    }
}

const adminAuthenticate = (req, res, next) => {
    const token = req.headers?.authorization && req.headers.authorization.split(" ")[1];
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

module.exports = {authenticate, adminAuthenticate};