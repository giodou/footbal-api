const fixtures = require('../src/fixtures');
const footballRespository = require('../src/footballRespository');

async function getLiveFixtures() {
    const response = await fixtures.getCurrentLiveFixtures();
    return response.data.response;
}

function syncFixturesInDataBase(fixtures) {
    fixtures.map(async (liveFixture) => {

        liveFixture.id = liveFixture.fixture.id;
        await footballRespository.replaceObj({ id: liveFixture.fixture.id }, { $set: liveFixture }, 'fixtures');
    });
}

async function syncFixturesStatsInDataBase(fixture) {
    console.log(`sincing stats from fixture id ${fixture.id}`);
    const timeResponse = new Date();
    const response = await fixtures.getFixturesLiveStats(fixture.id);

    let fixtureStats = response.data;
    fixtureStats.time = timeResponse;
    fixtureStats.fixture_id = fixture.id;

    footballRespository.insertObj(fixtureStats, 'fixture_realtime_stats');
}


async function syncFixturesStatsToDatabase() {
    console.log('sincing stats from football api...');

    let liveFixtures = await getLiveFixtures();
    syncFixturesInDataBase(liveFixtures);

    liveFixtures.map(async (fixture) => {
        syncFixturesStatsInDataBase(fixture);
    });
}

syncFixturesStatsToDatabase();

setInterval(syncFixturesStatsToDatabase, 1000 * 60);
