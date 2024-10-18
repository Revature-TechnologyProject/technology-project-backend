const express = require("express");

const {getSongs} = require("../services/songService");

const router = express.Router();

router.get("/", async (req, res) => {
    const {track, artist, year, genre, album, offset} = req.query;
    try {
        const result = await getSongs({track, artist, year, genre, album}, offset);
        res.status(200).json(result);
    } catch (err) {
        res.status(err.status).json({message: err.message});
    }
});

module.exports = router;