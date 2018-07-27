const MongoClient = require('mongodb').MongoClient
const config = require('../config')
const mongoOptions = { useNewUrlParser: true }

module.exports.connectToMongoDb = (callback) => {
    MongoClient.connect(config.MONGO_URL, mongoOptions, (err, client) => {
        if (err) { return callback(err, null, null) }
        const db = client.db(config.MONGO_DB_NAME)
        callback(null, db, client)
    })
}

module.exports.connectToMongoCollection = (collectionName, callback) => {
    MongoClient.connect(config.MONGO_URL, mongoOptions, (err, client) => {
        if (err) { return callback(err, null, null) }
        const db = client.db(config.MONGO_DB_NAME)
        const collection = db.collection(collectionName)
        callback(null, collection, client)
    })
}
