function isValidString(string) {
    return string && /\S/.test(string);
}

module.exports = {
    isValidString
};