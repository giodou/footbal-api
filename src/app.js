const db = require('../src/db');
const footballService = require('../src/services/footballService');

//conect and start application
db.connect()
    .then(() => console.log('database connected'))
    .then(async () => {

        const leaguesThatCoversRealtimeStatistics = await footballService.getAllLeaguesThatCoversRealtimeStatistics();

        footballService.syncLiveFixturesAndRealTimeStatsToDatabase(leaguesThatCoversRealtimeStatistics);
        
        setInterval(function () {
            footballService.syncLiveFixturesAndRealTimeStatsToDatabase(leaguesThatCoversRealtimeStatistics);
        }, process.env.TIME_BETWEEN_SINCS_IN_MILISECONDS);
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });

