var connect = require('./connect')
var async = require('async')

module.exports.checkIfChartExists = (chartName, mainCallback) => {
    async.waterfall([
        async.apply(connect.connectToMongoCollection, 'charts'),
        (collection, client, callback) => {
            collection.find({ name: chartName }).toArray((err, docs) => {
                client.close()
                if (err) { return callback(err, false) }
                if (!docs.length) { return callback(null, false) }
                callback(null, true)
            })
        }
    ], (err, result) => { mainCallback(err, result) })
}

module.exports.getChart = (chartName, mainCallback) => {
    async.waterfall([
        async.apply(connect.connectToMongoCollection, 'charts'),
        (collection, client, callback) => {
            collection.find({ name: chartName }).toArray((err, docs) => {
                client.close()
                if (err) { return callback(err, null) }
                if (!docs.length) { return callback(null, null) }
                callback(null, docs[0])
            })
        }
    ], (err, result) => { mainCallback(err, result) })
}

module.exports.getCharts = (mainCallback) => {
    async.waterfall([
        async.apply(connect.connectToMongoCollection, 'charts'),
        (collection, client, callback) => {
            collection.find({}).toArray((err, docs) => {
                client.close()
                if (err) { return callback(err, null) }
                callback(null, docs)
            })
        }
    ], (err, result) => { mainCallback(err, result) })
}

module.exports.createChart = (chart, mainCallback) => {
    async.waterfall([
        async.apply(connect.connectToMongoCollection, 'charts'),
        (collection, client, callback) => {
            collection.insert(chart, (err, r) => {
                client.close()
                if (err) { return callback(err, false) }
                if (!r.insertedCount) { return callback(null, false) }
                callback(null, true)
            })
        }
    ], (err, result) => { mainCallback(err, result) })
}

module.exports.updateChart = (chart, mainCallback) => {
    async.waterfall([
        async.apply(connect.connectToMongoCollection, 'charts'),
        (collection, client, callback) => {
            collection.updateOne({ name: chart.name }, chart, (err, result) => {
                if (err) { return callback(err, false) }
                if (!result.modifiedCount) { return callback(null, false) }
                callback(null, true)
            })
        }
    ], (err, result) => { mainCallback(err, result) })
}

module.exports.deleteChart = (chartName, mainCallback) => {
    async.waterfall([
        async.apply(connect.connectToMongoCollection, 'charts'),
        (collection, client, callback) => {
            collection.findOneAndDelete({ name: chartName }, (err, r) => {
                if (err) { return callback(err, false) }
                if (!r.value) { return callback(null, false) }
                callback(null, true)
            })
        }
    ], (err, result) => { mainCallback(err, result) })
}
