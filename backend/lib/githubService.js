const axios = require('axios');

const { GITHUB_CLIENT_ID } = process.env;
const { GITHUB_CLIENT_SECRET } = process.env;
const redirectURI = 'http://localhost:3000/github';

function getGithubAuthURL() {
    const rootUrl = 'https://github.com/login/oauth/authorize';
    const options = {
        redirect_uri: redirectURI,
        client_id: GITHUB_CLIENT_ID,
        scope: 'user'
    };
    const usp = new URLSearchParams(options);

    return `${rootUrl}?${usp.toString()}`;
}

async function getTokens(code) {
    // Uses the code to get tokens that can be used to fetch the user's profile
    const url = 'https://github.com/login/oauth/access_token';
    const values = {
        code,
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        redirect_uri: redirectURI
    };

    const usp = new URLSearchParams(values);

    try {
        const res = await axios.post(url, usp.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json'
            }
        });
        return res.data;
    } catch (error) {
        if (error.response) {
            console.error(error.response.data);
        }
        throw new Error(`Failed to get token: ${error.message}`);
    }
}

async function fetchUser(accessToken) {
    // Fetch the user's profile with the access token and bearer
    try {
        const res = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `token ${accessToken}`
            }
        });
        const res1 = await axios.get('https://api.github.com/user/emails', {
            headers: {
                Authorization: `token ${accessToken}`
            }
        });

        const res2 = { ...res.data, ...res1.data[0] };

        // dev log
        console.log(res2);

        return res2;
    } catch (error) {
        if (error.response) {
            console.error(error.response.data);
        }
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}

const githubService = { getGithubAuthURL, getTokens, fetchUser };
module.exports = githubService;