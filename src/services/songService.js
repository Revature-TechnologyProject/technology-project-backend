const songDAO = require("../repository/songDAO");


async function getSongs(query, type, offset = 0) {

    let q = new QBuilder();
    for (const key in query) {
        q.addQuery(key, query[key]);
    }
    q = q.build();

    const {tracks} = await songDAO.getSongs(q, type, offset);

    const filtered = tracks.items.map((item) => {
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
    const total = tracks.total - offset;
    let previous = "";
    if (offset > 0) {
        let prev = (offset - (total - (total - tracks.limit)) > 0) ? offset - (total - (total - tracks.limit)) : 0;
        previous = constructNextPageURL(query, prev, type);
    }
    offset = tracks.next ? offset + (total - (total - tracks.limit)) : null;
    const next = constructNextPageURL(query, offset, type);
    return {showPrevious: previous, showMore: next, songs: filtered};
}

function constructNextPageURL(query, offset, type) {
    if (offset === null) {
        return "";
    }
    // Maybe put the base url in a .env variable
    let url = `http://localhost:3000/songs?type=${type}`;
    for (const key in query) {
        if (query[key] !== undefined) {
            url += `&${key}=${query[key]}`;
        }
    }
    url+=`offset=${offset}`;
    return url;
}

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