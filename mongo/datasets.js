var connect = require('./connect')
var async = require('async')

module.exports.checkIfDatasetExists = (datasetName, mainCallback) => {
    async.waterfall([
        async.apply(connect.connectToMongoCollection, 'datasets'),
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
        async.apply(connect.connectToMongoCollection, 'datasets'),
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

module.exports.getDataFromDataset = (datasetName, options, mainCallback) => {
    async.waterfall([
        async.apply(connect.connectToMongoCollection, datasetName),
        (collection, client, callback) => {
            collection.find(options).toArray((err, docs) => {
                client.close()
                if (err) { return callback(err, null) }
                callback(null, docs)
            })
        }
    ], (err, result) => {
        mainCallback(err, result)
    })
}

module.exports.getDatasetStructure = (datasetName, mainCallback) => {
    async.waterfall([
        async.apply(connect.connectToMongoCollection, 'datasets'),
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

module.exports.addDataToDataset = (datasetName, data, mainCallback) => {
    async.waterfall([
        async.apply(connect.connectToMongoCollection, datasetName),
        (collection, client, callback) => {
            collection.insert(data, (err, r) => {
                client.close()
                if (err) { return callback(err, false) }
                if (!r.insertedCount) { return callback(null, false) }
                callback(null, true)
            })
        }
    ], (err, result) => {
        mainCallback(err, result)
    })
}

module.exports.deleteDataset = (datasetName, mainCallback) => {
    async.waterfall([
        connect.connectToMongoDb,
        (db, client, callback) => {
            db.collection(datasetName, { strict: true }, (err, collection) => {
                if (err) { return callback(null, db, client) }
                collection.drop((err, r) => {
                    if (err) { return callback(err, null) }
                    callback(null, db, client)
                })
            })
        },
        (db, client, callback) => {
            const collection = db.collection('datasets')
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
