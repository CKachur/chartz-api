const MongoClient = require('mongodb').MongoClient
const config = require('../config')
const async = require('async')
const mongoOptions = { useNewUrlParser: true }

var connectToMongoCollection = (collectionName, callback) => {
    MongoClient.connect(config.MONGO_URL, mongoOptions, (err, client) => {
        if (err) { return callback(err, null, null) }
        const db = client.db(config.MONGO_DB_NAME)
        const collection = db.collection(collectionName)
        callback(null, collection, client)
    })
}

module.exports.checkIfDatasetExists = (datasetName, mainCallback) => {
    async.waterfall([
        async.apply(connectToMongoCollection, 'datasets'),
        (collection, client, callback) => {
            collection.find({ name: datasetName }).toArray((err, docs) => {
                client.close()
                if (err) { return callback(err, false) }
                if (!docs.length) { return callback(null, false) }
                callback(null, true)
            })
        }
    ], (err, result) => {
        return mainCallback(err, result)
    })
}

module.exports.createDataset = (datasetName, structure, mainCallback) => {
    async.waterfall([
        async.apply(connectToMongoCollection, 'datasets'),
        (collection, client, callback) => {
            collection.insert({ name: datasetName, structure: structure }, (err, r) => {
                client.close()
                if (err) { return callback(err, false) }
                if (!r.insertedCount) { return callback(null, false) }
                callback(null, true)
            })
        }
    ], (err, result) => {
        return mainCallback(err, result)
    })
}

module.exports.getDataFromDataset = (datasetName, options) => {

}

module.exports.getDatasetStructure = (datasetName, mainCallback) => {
    async.waterfall([
        async.apply(connectToMongoCollection, 'datasets'),
        (collection, client, callback) => {
            collection.find({ name: datasetName }).toArray((err, docs) => {
                client.close()
                if (err) { return callback(err, null) }
                if (!docs.length) { return callback(null, null) }
                callback(null, docs[0].structure)
            })
        }
    ], (err, result) => {
        mainCallback(err, result)
    })
}

module.exports.addDataToDataset = (datasetName, data) => {

}

module.exports.deleteDataset = (datasetName, mainCallback) => {
    async.waterfall([
        async.apply(connectToMongoCollection, 'datasets'),
        (collection, client, callback) => {
            var response = collection.findOneAndDelete({ name: datasetName }, (err, r) => {
                client.close()
                if (err) { return callback(err, false) }
                if (!r.value) { return callback(null, false) }
                callback(null, true)
            })
        }
    ], (err, result) => {
        mainCallback(err, result)
    })
}
