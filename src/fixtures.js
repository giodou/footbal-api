var axios = require("axios").default;

function registerRequest(options){
    const request = {
        request: options,
        time: new Date() 
    }

    const footballRespository = require('../src/footballRespository');
    footballRespository.insertObj(request, 'requests');
}


async function getCurrentLiveFixtures(){
    var options = {
        method: 'GET',
        url: `${process.env.API_BASE_URL}/v3/fixtures`,
        params: {live: 'all', timezone: process.env.X_RAPIDAPI_TIMEZONE},
        headers: {
          'x-rapidapi-host': process.env.X_RAPIDAPI_HOST,
          'x-rapidapi-key': process.env.X_RAPIDAPI_KEY
        }
      };

      registerRequest(options);
      return await axios.request(options)
}

async function getFixturesLiveStats(fixtureId){
    var options = {
        method: 'GET',
        url: `${process.env.API_BASE_URL}/v3/fixtures/statistics`,
        params: {fixture: fixtureId},
        headers: {
            'x-rapidapi-host': process.env.X_RAPIDAPI_HOST,
            'x-rapidapi-key': process.env.X_RAPIDAPI_KEY
          }
      };

      registerRequest(options);
      return await axios.request(options);
}



module.exports = {
    getCurrentLiveFixtures,
    getFixturesLiveStats
}
