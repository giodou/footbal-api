const { getMongoClient }  = require('./db');

async function insertObj(obj, collection) {
    const client = await getMongoClient();
    const database = client.db('football-data')
    const dbCollection = database.collection(collection);
    await dbCollection.insertOne(obj);
}

async function replaceObj(query, obj, collection) {
    const client = await getMongoClient();
    const database = client.db('football-data')
    const dbCollection = database.collection(collection);
    
    const options = { upsert: true };
    dbCollection.updateOne(query, obj, options);
}


module.exports = { insertObj, replaceObj }
