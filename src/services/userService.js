const bcrypt = require('bcrypt');
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
const userDAO = require('../repository/userDAO');
const { throwIfError } = require('../utilities/dynamoUtilities');

const register = async (username, password) => {
    const rounds = 10;
    password = bcrypt.hashSync(password, rounds);

    const userExists = (await userDAO.queryByUsername(username)).Count;
    if (userExists) {
        throw { status: 400, message: "Username already taken" };
    }
    const user = {
        class: "user",
        itemID: uuid.v4(),
        username,
        password,
        role: "user",
        postsLiked: [],
        postsDisliked: []
    }
    const result = await userDAO.putUser(user);
    throwIfError(result);
    delete (user.password);
    return user;
}

const login = async (username, password) => {
    const result = await userDAO.queryByUsername(username);
    throwIfError(result);
    const user = result.Items[0];
    if (user && bcrypt.compareSync(password, user.password)) {
        return createToken(user);
    }

    throw {
        status: 400,
        message: "Invalid username/password"
    }
}

const updateRole = async (id, role) => {
    const getUserResult = await userDAO.getUserById(id);
    throwIfError(getUserResult);
    const foundUser = getUserResult.Item;
    if (!foundUser) {
        throw {
            status: 400,
            message: `User with id ${id} not found`
        }
    }

    const currentRole = foundUser.role;
    if (currentRole === role) {
        throw {
            status: 400,
            message: `User is already role ${role}`
        }
    } else if (role !== "admin") {
        throw {
            status: 400,
            message: "Cannot demote admin, use AWS console instead"
        }
    }

    const updateResult = await userDAO.updateRole(id, role);
    throwIfError(updateResult);
    return updateResult;
}

const deleteUser = async (id) => {
    // Maybe add user exist check here, but not needed since dynamo wont error out with a not found id
    await userDAO.deleteUser(id);
}

const addLike = async (like, postID, userID) => {
    const user = await userDAO.getUserById(userID);
    throwIfError(user);
    const dislikedList = user.Item.postsDisliked;
    const likedList = user.Item.postsLiked;
    if (like == 1){
        if (likedList.includes(postID)){
            throw {
                status: 400,
                message: "Post is already liked"
            }
        }
        if (dislikedList.includes(postID)){
            const data = await userDAO.removeDislike(dislikedList.indexOf(postID), userID);
            throwIfError(data);
            like = 2;
        }
        const result = await userDAO.updateLike(postID, userID);
        throwIfError(result);
    }
    else{
        if (dislikedList.includes(postID)){
            throw {
                status: 400,
                message: "Post is already disliked"
            }
        }
        if (likedList.includes(postID)){
            const data = await userDAO.removeLike(likedList.indexOf(postID), userID);
            throwIfError(data);
            like = -2;
        }
        const result = await userDAO.updateDislike(postID, userID);
        throwIfError(result);
    }
    return like;
}

function createToken(user) {
    // Delete unneccesarry attributes as needed here
    delete (user.password);

    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1d" });
    return token;
}

module.exports = {
    register,
    login,
    deleteUser,
    updateRole,
    addLike
};