
let token;

async function getToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: new URLSearchParams({
          'grant_type': 'client_credentials',
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + (Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')),
        },
      });
      const {access_token} = await response.json();
      return access_token;
}

async function getSongs(q, offset, retries = 0) {
    if (!token) {
        token = await getToken();
    }
    if (retries === 2) {
        // Recursive call stopper
        throw {status: 502, message: "Unable to search"}
    }

    const response = await fetch(`https://api.spotify.com/v1/search?q=${q}&type=track&market=US&offset=${offset}`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token },
    });
    const json = await response.json();

    if (json.error) {
        const {status} = json.error;
        if (status !== 401) {
            throw json.error;
        }
        // 401 means token expired so retry method after getting a new token
        token = await getToken();
        return await getSongs(q, offset, retries + 1);
    }
    return json;
}

module.exports = {getSongs};