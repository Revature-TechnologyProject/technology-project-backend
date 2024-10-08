const { isValidBodyProperty } = require("../utilities/routerUtilities");

const validRoles = ["user", "admin"];

function validateUsername(req, res, next) {
    if (isValidBodyProperty(req, res, "username")) {
        next();
    }
}

function validatePassword(req, res, next) {
    if (isValidBodyProperty(req, res, "password")) {
        next();
    }
}

function validateRole(req, res, next) {
    const role = req.body.role;
    const isValidRole = validRoles.includes(role);
    if (isValidRole) {
        next();
        return;
    }
    res.status(400).json({ message: `Invalid role ${role}` });
}

function validateLike(req, res, next) {
    const like = req.body.like;
    if (isNaN(like) || (like != 1 && like != -1)){
        res.status(400).json({
            message: "Invalid like"
        });
        return;
    }
    next();
}

module.exports = {
    validateUsername,
    validatePassword,
    validateRole,
    validateLike
};