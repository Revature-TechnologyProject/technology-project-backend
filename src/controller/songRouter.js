const express = require("express");

const {getSongs} = require("../services/songService");

const router = express.Router();

router.get("/", async (req, res) => {
    const {track, artist, year, genre, album, type} = req.query;
    let {offset} = req.query;
    if (!type || (type !== "album" && type !== "track" && type !== "artist")) {
        return res.status(400).json("type must be provided. must be 'album', 'track', or 'artist'");
    }

    if (type === "album" && !artist && !year && !album) {
        return res.status(400).json({message: "An artist, year, or album must be provided through query params for type 'album'"});
    } else if (type === "track" && !track && !artist && !year && !genre && !album) {
        return res.status(400).json({message: "A track, artist, year, album, or genre must be provided through query params for type 'track'"});
    } else if (type === "artist" && !artist && !year && !genre) {
        return res.status(400).json({message: "An artist, year, or genre must be provided through query params for type 'artist'"});
    }
    
    if (offset) {
        offset = parseInt(offset); // returns NaN if fails
        if ((!offset && offset !== 0) || offset < 0) {
            return res.status(400).json({message: "Offset must be a number and non negative"});
        }
    }

    try {
        const result = await getSongs({track, artist, year, genre, album}, type, offset);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(502).json({message: "The server was acting as a gateway or proxy and received an invalid response from the upstream server"});
    }
})

module.exports = router;