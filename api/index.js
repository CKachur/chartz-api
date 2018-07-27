var express = require('express')
var bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

var dataset = require('./dataset')

app.get('/dataset', dataset.getDataset)
app.post('/dataset', dataset.postDataset)
app.put('/dataset', dataset.putDataset)
app.delete('/dataset', dataset.deleteDataset)

module.exports = app
