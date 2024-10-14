const { isValidString } = require('../utilities/stringUtilities');

function handleServiceError(error, res) {
    console.error(error);

    const statusCode = error.status;
    if (!statusCode) {
        return res.status(500).json({ message: "Internal Server error" })
    }
    const message = error.message;
    return res.status(statusCode).json({ message });
}

function isValidBodyProperty(req, res, propertyName) {
    const property = req.body[propertyName];

    if (!isValidString(property)) {
        res.status(400).json({
            message: `Invalid property ${propertyName}`
        });
        return false;
    }
    return true;
}

module.exports = {
    handleServiceError,
    isValidBodyProperty
};