const songDAO = require("../repository/songDAO");


async function getSongs(query, offset = 0) {
    const {track, artist, year, genre, album} = query;
    const error = {status: 400, message: ""};
    // Only allow type=tracks. It changes the returned object by spotify slighty which breaks stuff 
    // instead of data.tracks it would become data.artists or data.albums
    // Since this is the getSongs path, I decided to default to track
    // We can add endpoints to the other types (album, artist) if we want

    if (!track && !artist && !year && !genre && !album) {
        error.message = "A track, artist, year, album, or genre must be provided through query params";
        throw error;
    }
    if (typeof(offset) === "string") {
        offset = parseInt(offset); // returns NaN if fails
        if ((!offset && offset !== 0) || offset < 0) {
            error.message = "Offset must be a non-negative number"
            throw error;
        }
    }

    const builder = new QBuilder();
    for (const key in query) {
        builder.addQuery(key, query[key]);
    }
    const q = builder.build();

    try {
        const {tracks} = await songDAO.getSongs(q, offset);
        const filtered = cleanData(tracks.items);
    
        const total = tracks.total - offset;
        let previous = "";
        if (offset > 0) {
            const previousOffset = (offset - (total - (total - tracks.limit)) > 0) ? offset - (total - (total - tracks.limit)) : 0;
            previous = constructPageURL(query, previousOffset);
        }
        // There's a bug with spotifies return for tracks.next
        const nextOffset = tracks.next ? offset + (total - (total - tracks.limit)) : null;

        const next = constructPageURL(query, nextOffset);
        return {showPrevious: previous, showMore: next, songs: filtered};
    } catch (err) {
        console.log(err);
        // Any error here means something happened with the request to spotify. Default to 502
        error.status = 502;
        error.message = "The server was acting as a gateway or proxy and received an invalid response from the upstream server";
        throw error;
    }
}

/**
 * Cleans up the spotify API data to only contain data we may need
 * 
 * @param data 
 * @returns An object of cleaned data
 */
function cleanData(data) {
    return data.map((item) => {
        const artists = item.artists.map((artist) => {
            return {id: artist.id, name: artist.name, url: artist.external_urls.spotify}
        })
        return {
            spotifyId: item.id,
            name: item.name,
            link: item.external_urls.spotify,
            popularity: item.popularity,
            image: item.album.images[1].url,
            artists
        }
    });
}

/**
 *  Creates a url that will jump between paginated results based on the offset
 * 
 * @param query The input parameters given by the user
 * @param offset The offset to start from
 * @returns string of the continuation url
 */
function constructPageURL(query, offset) {
    if (offset === null) {
        return "";
    }
    // Maybe put the base url in a .env variable
    let url = `http://localhost:3000/songs?type=track`;
    for (const key in query) {
        if (query[key] !== undefined) {
            url += `&${key}=${query[key]}`;
        }
    }
    url+=`&offset=${offset}`;
    return url;
}

/**
 * Used to build a query string for the spotify API
 */
class QBuilder {
    constructor() {
        this.q = "";
    }

    addQuery(key, value) {
        if (value !== undefined) {
            if (this.q) {
                this.q += `+${key}%3A${value}`;
            } else {
                this.q += `${key}%3A${value}`
            }
        }
        return this;
    }

    build() {
        return this.q;
    }
}

module.exports = {getSongs}