const axios = require("axios").default;
const footballRespository = require('../repositories/footballRespository');

function registerRequest(options) {
    try {
        const request = {
            request: options,
            time: new Date()
        }

        footballRespository.insertObj(request, 'requests');
    }
    catch (err) {
        throw err;
    }
}


async function getCurrentLiveFixtures() {
    try {
        var options = {
            method: 'GET',
            url: `${process.env.API_BASE_URL}/v3/fixtures`,
            params: { live: 'all', timezone: process.env.X_RAPIDAPI_TIMEZONE },
            headers: {
                'x-rapidapi-host': process.env.X_RAPIDAPI_HOST,
                'x-rapidapi-key': process.env.X_RAPIDAPI_KEY
            }
        };

        registerRequest(options);
        return await axios.request(options)
    }
    catch (err) {
        throw err;
    }

}

async function getFixturesLiveStats(fixtureId) {
    try {
        var options = {
            method: 'GET',
            url: `${process.env.API_BASE_URL}/v3/fixtures/statistics`,
            params: { fixture: fixtureId },
            headers: {
                'x-rapidapi-host': process.env.X_RAPIDAPI_HOST,
                'x-rapidapi-key': process.env.X_RAPIDAPI_KEY
            }
        };

        registerRequest(options);
        return await axios.request(options);
    }
    catch (err) {
        throw err;
    }
}



module.exports = {
    getCurrentLiveFixtures,
    getFixturesLiveStats
}
