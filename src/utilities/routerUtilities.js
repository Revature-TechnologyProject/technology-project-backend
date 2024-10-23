const { isValidString } = require("./stringUtilities");

function handleServiceError(error, res) {
    console.error(error);

    const statusCode = error.status;
    if (!statusCode) {
        return res.status(500).json({ message: "Internal Server error" })
    }
    const message = error.message;
    return res.status(statusCode).json({ message });
}

/*
 summary: Returns a middleware function using specified params
 parameters:
    propertyName: The name of the property to check
    isValidCallback: A callback function that takes the body param 
        and returns a bool indicating if the value is valid 
    required: If false, middleware will still pass even if property is not found
*/
function validateBody(propertyName, isValidCallback, required = true) {
    return (req, res, next) => {
        const param = req.body[propertyName];
        const exists = req.body.hasOwnProperty(propertyName);
        if (!exists && required) {
            return res.status(400).json({
                message: `Missing required property ${propertyName}`
            });
        } else if (exists && !isValidCallback(param)) {
            return res.status(400).json({
                message: `Invalid property ${propertyName}`
            });
        }
        next();
    };
}

function validateBodyString(propertyName, required = true) {
    return validateBody(propertyName, (property) => isValidString(property), required);
}

module.exports = {
    handleServiceError,
    validateBody,
    validateBodyString
};