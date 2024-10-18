function validateTextBody(req, res, next) {
    const desc = req.body.text;

    if(!desc) {
        res.status(400).json({
            message: "Invalid post text"
        });
        return;
    }
    next();
}

function validateScore(req, res, next) {
    const score = req.body.score;

    if(isNaN(score) || score < 0 || score > 100) {
        res.status(400).json({
            message: "Invalid score"
        });
        return;
    }
    next();
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
    validateTextBody,
    validateScore,
    validateLike
}