var express = require('express')
var bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

var dataset = require('./dataset')
var chart = require('./chart')

// Dataset endpoints
app.get('/dataset', dataset.getDataset)
app.post('/dataset', dataset.postDataset)
app.put('/dataset', dataset.putDataset)
app.delete('/dataset', dataset.deleteDataset)
// Chart endpoints
app.get('/chart', chart.getChart)
app.post('/chart', chart.postChart)
app.put('/chart', chart.putChart)
app.delete('/chart', chart.deleteChart)

module.exports = app
