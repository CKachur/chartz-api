var connect = require('./connect')
var async = require('async')

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
    ], (err, result) => { return mainCallback(err, result) })
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
