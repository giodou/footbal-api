const fixtureApi = require('../apis/fixturesApi');
const footballRespository = require('../repositories/footballRespository');
const { waitTime } = require('../utils/timeUtils')

async function getLiveFixtures() {
    try {
        const response = await fixtureApi.getCurrentLiveFixtures();

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
        const response = await fixtureApi.getFixturesLiveStats(fixture.id);

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

async function syncLiveFixturesAndRealTimeStatsToDatabase() {
    try {

        let liveFixtures = await getLiveFixturesWithRety();

        if (liveFixtures) {
            console.log(`sincing stats from ${liveFixtures.length} fixtures...`);

            saveFixtures(liveFixtures);
            sincFixturesStatsToDatabase(liveFixtures);
        }

    } catch (err) {
        console.log(`error in syncLiveFixturesAndRealTimeStatsToDatabase: ${err}`);
    }
}

module.exports = {
    syncLiveFixturesAndRealTimeStatsToDatabase
}