var mongo = require('../../mongo')
var apiCheck = require('../apiCheck')
var async = require('async')

module.exports.getChart = (req, res) => {
    if (req.query.name == undefined) { return res.send('No name specified for chart') }

    mongo.charts.getChart(req.query.name, (err, result) => {
        if (err) { return res.send(err) }
        if (result == null) { return res.send('Could not find chart') }
        res.json(result)
    })
}

module.exports.getCharts = (req, res) => {
    mongo.charts.getCharts((err, charts) => {
        if (err) { return res.send(err) }
        res.json({ charts: charts })
    })
}

module.exports.postChart = (req, res) => {
    if (req.body == undefined) { return res.send('No body specified') }
    if (req.body.name == undefined) { return res.send('No name specified for chart') }
    if (req.body.type == undefined) { return res.send('No type specified for chart') }
    if (req.body.dataset == undefined) { return res.send('No dataset specified for chart') }

    async.waterfall([
        (callback) => {
            mongo.charts.checkIfChartExists(req.body.name, (err, chartExists) => {
                if (err) { return callback(err) }
                if (chartExists) { return callback('Chart already exists') }
                callback(null)
            })
        },
        (callback) => {
            mongo.datasets.getDatasetStructure(req.body.dataset, (err, structure) => {
                if (err) { return callback(err) }
                if (structure == null) { return callback('Could not find dataset structure') }

                var cleanedChart = apiCheck.chart.checkChart(req.body, structure)
                if (typeof(cleanedChart) == 'string') { return callback(cleanedChart) }
                callback(null, cleanedChart)
            })
        },
        (cleanedChart, callback) => {
            mongo.charts.createChart(cleanedChart, (err, createdChart) => {
                if (err) { return callback(err) }
                if (!createdChart) { return callback('Could not create chart') }
                callback(null)
            })
        }
    ], (err) => {
        if (err) { return res.send(err) }
        res.send('POST /chart successful')
    })
}

module.exports.putChart = (req, res) => {
    if (req.body == undefined) { return res.send('No body specified') }
    if (req.body.name == undefined) { return res.send('No name specified for chart') }
    if (req.body.type == undefined) { return res.send('No type specified for chart') }
    if (req.body.dataset == undefined) { return res.send('No dataset specified for chart') }

    async.waterfall([
        (callback) => {
            mongo.charts.checkIfChartExists(req.body.name, (err, chartExists) => {
                if (err) { return callback(err) }
                if (!chartExists) { return callback('Chart does not exist') }
                callback(null)
            })
        },
        (callback) => {
            mongo.datasets.getDatasetStructure(req.body.dataset, (err, structure) => {
                if (err) { return callback(err) }
                if (structure == null) { return callback('Could not find dataset structure') }

                var cleanedChart = apiCheck.chart.checkChart(req.body, structure)
                if (typeof(cleanedChart) == 'string') { return callback(cleanedChart) }
                callback(null, cleanedChart)
            })
        },
        (cleanedChart, callback) => {
            mongo.charts.updateChart(cleanedChart, (err, updatedChart) => {
                if (err) { return callback(err) }
                if (!updatedChart) { return callback('Could not update chart') }
                callback(null)
            })
        }
    ], (err) => {
        if (err) { return res.send(err) }
        res.send('PUT /chart successful')
    })
}

module.exports.deleteChart = (req, res) => {
    if (req.body == undefined) { return res.send('No body specified') }
    if (req.body.name == undefined) { return res.send('No name specified for chart') }

    mongo.charts.deleteChart(req.body.name, (err, deletedChart) => {
        if (err) { return res.send(err) }
        if (!deletedChart) { return res.send('Couldn\'t delete chart') }
        res.send('DELETE /chart successful')
    })
}
