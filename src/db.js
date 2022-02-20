const { MongoClient  } = require("mongodb");

async function getMongoClient() {
    const client = new MongoClient(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}?retryWrites=true&writeConcern=majority`);

    await client.connect();

    return client;
}

module.exports = {
    getMongoClient
}