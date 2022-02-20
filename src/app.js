const db = require('../src/db');
const fixtureService = require('../src/services/fixtureService');

//conect and start application
db.connect()
    .then(() => console.log('database connected'))
    .then(() => {
        fixtureService.syncFixturesStatsyncLiveFixturesAndRealTimeStatsToDatabasesToDatabase();
        setInterval(fixtureService.syncLiveFixturesAndRealTimeStatsToDatabase, 1000 * 60);
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });

