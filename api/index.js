var express = require('express')
var bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

var endpoints = require('./endpoints')

// Dataset endpoints
app.get('/dataset', endpoints.dataset.getDataset)
app.post('/dataset', endpoints.dataset.postDataset)
app.put('/dataset', endpoints.dataset.putDataset)
app.delete('/dataset', endpoints.dataset.deleteDataset)
// Chart endpoints
app.get('/chart', endpoints.chart.getChart)
app.post('/chart', endpoints.chart.postChart)
app.put('/chart', endpoints.chart.putChart)
app.delete('/chart', endpoints.chart.deleteChart)

module.exports = app
