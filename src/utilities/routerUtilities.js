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
        const exists = propertyName in req.body;
        if (!exists && required) {
            return res.status(400).json({
                message: `Missing required property ${propertyName}`
            });
        } else if (exists && !isValidCallback(param)) {
            return res.status(400).json({
                message: `Invalid property ${propertyName}`
            });
        }
        if (exists && propertyName == "username"){
            if (req.body.username.length < 4){
                return res.status(400).json({message: "Username must be at least 4 characters long"});
            }
            if (/[A-Za-z0-9]/.test(req.body.username)){
                return res.status(400).json({message: "Username must contain a letter or number"});
            }
        }
        if (exists && propertyName == "password"){
            if (req.body.password.length < 6){
                return res.status(400).json({message: "Password must be at least 6 characters long"});
            }
            if (!/[^A-Za-z0-9]/.test(req.body.password) || !/\d/.test(req.body.password)){
                return res.status(400).json({message: "Password must contain a special character and a number"});
            }
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