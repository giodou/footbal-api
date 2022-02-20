const fixtures = require('../src/fixtures');
const footballRespository = require('../src/footballRespository');

async function getLiveFixtures() {
    try {
        const response = await fixtures.getCurrentLiveFixtures();
        return response.data.response;
    } catch (err) {
        console.log(`error in getLiveFixtures: ${err}`);
    }
}

function syncFixturesInDataBase(fixtures) {
    try {
        fixtures.map(async (liveFixture) => {
            try {
                liveFixture.id = liveFixture.fixture.id;
                await footballRespository.replaceObj({ id: liveFixture.fixture.id }, { $set: liveFixture }, 'fixtures');
            } catch (err) {
                console.log(`error in syncFixturesInDataBase: ${err}`);
            }

        });
    } catch (err) {
        console.log(`error in syncFixturesInDataBase: ${err}`);
    }

}

async function syncFixturesStatsInDataBase(fixture) {
    try {
        console.log(`sincing stats from fixture id ${fixture.id}`);
        const timeResponse = new Date();
        const response = await fixtures.getFixturesLiveStats(fixture.id);

        let fixtureStats = response.data;
        fixtureStats.time = timeResponse;
        fixtureStats.fixture_id = fixture.id;

        footballRespository.insertObj(fixtureStats, 'fixture_realtime_stats');
    } catch (err) {
        console.log(`error in syncFixturesStatsInDataBase: ${err}`);
    }
}


async function syncFixturesStatsToDatabase() {
    try {
        console.log('sincing stats from football api...');

        let liveFixtures = await getLiveFixtures();
        syncFixturesInDataBase(liveFixtures);

        liveFixtures.map(async (fixture) => {
            syncFixturesStatsInDataBase(fixture);
        });
    } catch (err) {
        console.log(`error in syncFixturesStatsToDatabase: ${err}`);
    }
}

syncFixturesStatsToDatabase();

setInterval(syncFixturesStatsToDatabase, 1000 * 60);
