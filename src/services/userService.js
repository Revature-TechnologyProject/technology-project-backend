const bcrypt = require('bcrypt');
const { putUser, queryByUsername } = require('../repository/userDAO');
const { throwIfError } = require('../utilities/dynamoUtilities');
const { createToken } = require('../utilities/jwtUtilities');

async function register(username, password) {
    const rounds = 10;
    password = await bcrypt.hash(password, rounds);

    const userExists = (await queryByUsername(username)).Count;
    if (userExists) {
        throw {
            name: 400,
            message: "Username already taken"
        };
    }

    const result = await putUser(username, password);
    const statusCode = result?.$metadata.httpStatusCode;
    throwIfError(statusCode);
}

async function login(username, password) {
    const user = await queryByUsername(username);
    if (user && bcrypt.compare(password, user.password)) {
        return createToken(user);
    }

    throw {
        name: 400,
        message: "Invalid username/password"
    }
}

async function getUserByUsername(username) {
    const result = await queryByUsername(username);
    const statusCode = result ? result.$metadata.httpStatusCode : 500;
    const foundUser = result?.Item;
    throwIfError(statusCode);
    return foundUser;
}

module.exports = {
    register,
    login,
    getUserByUsername
};