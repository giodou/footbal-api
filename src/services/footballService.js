
const footballApi = require('../apis/footballApi');
const footballRespository = require('../repositories/footballRespository');
const { waitTime } = require('../utils/timeUtils')

async function getLiveFixtures() {
    try {
        const response = await footballApi.getCurrentLiveFixtures();

        if (response && response.data)
            return response.data.response;
        else
            throw 'cant get data in this time';

    } catch (err) {
        console.error(`error in getLiveFixtures: ${err}`);
        throw err;
    }
}

async function getLiveFixturesWithRety(numberOfReTrys) {

    if (!numberOfReTrys)
        numberOfReTrys = 0;

    if (numberOfReTrys > process.env.NUMBER_OF_RETRYS_ON_API_ERROR)
        return false;

    let liveFixtures = [];

    try {
        console.log('getting in live fixtures from football api...');
        liveFixtures = await getLiveFixtures();
        return liveFixtures;
    } catch (err) {
        //retry
        await waitTime(15);
        console.log('[retrying] sincing stats from football api...');
        return getLiveFixturesWithRety(++numberOfReTrys)
    }
}

function saveFixtures(fixtures) {
    try {
        if (fixtures)
            fixtures.map(async (liveFixture) => {
                try {
                    liveFixture.id = liveFixture.fixture.id;
                    footballRespository.replaceObj({ id: liveFixture.fixture.id }, { $set: liveFixture }, 'fixtures');
                } catch (err) {
                    console.error(`error in syncFixturesInDataBase: ${err}`);
                }

            });
    } catch (err) {
        console.error(`error in syncFixturesInDataBase: ${err}`);
    }
}

function saveFixturesWithRealTime(fixtures) {
    try {
        if (fixtures)
            fixtures.map(async (liveFixture) => {
                try {
                    liveFixture.id = liveFixture.fixture.id;
                    footballRespository.replaceObj({ id: liveFixture.fixture.id }, { $set: liveFixture }, 'fixtures_with_realtime_stats');
                } catch (err) {
                    console.error(`error in syncFixturesInDataBase: ${err}`);
                }

            });
    } catch (err) {
        console.error(`error in syncFixturesInDataBase: ${err}`);
    }
}

function sincFixturesStatsToDatabase(liveFixturesStats) {
    liveFixturesStats.map(fixture => {
        sincAndSaveFixtureStats(fixture);
    })
}

async function getFixtureStatsWitRetry(fixture, numberOfReTrys) {
    console.log(`getting stats from fixture id ${fixture.id}`);

    if (!numberOfReTrys)
        numberOfReTrys = 0;

    if (numberOfReTrys > process.env.NUMBER_OF_RETRYS_ON_API_ERROR)
        return false;

    try {
        const response = await footballApi.getFixturesLiveStats(fixture.id);

        if (fixture.id === 821358) {
            console.log('Aqui');
        }

        if (response && response.data) {
            return response.data;
        } else
            throw 'cant get data in this time';

    } catch (err) {
        await waitTime(20);
        return getFixtureStatsWitRetry(fixture, ++numberOfReTrys);
    }
}

async function sincAndSaveFixtureStats(fixture) {
    try {
        let fixtureStats = await getFixtureStatsWitRetry(fixture);

        if (fixtureStats) {
            const timeResponse = new Date();
            fixtureStats.time = timeResponse;
            fixtureStats.fixture_id = fixture.id;

            footballRespository.insertObj(fixtureStats, 'fixture_realtime_stats');
        }

    } catch (err) {
        console.error(`error in sincAndSaveFixtureStats: ${err}`);
    }
}

async function syncLiveFixturesAndRealTimeStatsToDatabase(leaguesWithRealtimeStats) {
    try {

        let liveFixtures = await getLiveFixturesWithRety();

        if (liveFixtures) {
            console.log(`sincing ${liveFixtures.length} fixtures...`);
            saveFixtures(liveFixtures);
            
            const coveredRealtimeStatsFixtures = liveFixtures.filter(fixture => leaguesWithRealtimeStats.find(league_id =>  league_id === fixture.league.id));
            saveFixturesWithRealTime(coveredRealtimeStatsFixtures);


            console.log(`sincing stats from ${coveredRealtimeStatsFixtures.length} covered fixtures...`);
            sincFixturesStatsToDatabase(coveredRealtimeStatsFixtures);
        }

    } catch (err) {
        console.log(`error in syncLiveFixturesAndRealTimeStatsToDatabase: ${err}`);
    }
}

async function getAllLeaguesThatCoversRealtimeStatistics() {
    const leagues = await footballApi.getAllLeagues();

    const coveredLeagues = leagues.filter(league =>
        league.seasons[league.seasons.length - 1].coverage.fixtures.statistics_fixtures
        && (league.seasons[league.seasons.length - 1].current));

    const coveredLeagueIds = coveredLeagues.map(obj => {
        return obj.league.id
    })

    return coveredLeagueIds;
}

async function getAllLeaguesThatCoversPredictions() {
    const leagues = await footballApi.getAllLeagues();

    const coveredLeagues = leagues.filter(league =>
        league.seasons[league.seasons.length - 1].coverage.predictions
        && (league.seasons[league.seasons.length - 1].current));

    const coveredLeagueIds = coveredLeagues.map(obj => {
        return obj.league.id
    })

    console.log(`${coveredLeagues.length} leagues with predicitons covered`)

    return coveredLeagueIds;
}

module.exports = {
    syncLiveFixturesAndRealTimeStatsToDatabase,
    getAllLeaguesThatCoversRealtimeStatistics,
    getAllLeaguesThatCoversPredictions
}