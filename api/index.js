var express = require('express')
var bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/dataset', (req, res) => {
    if (req.body == undefined) { return res.send('No body specified') }
    if (req.body.name == undefined) { return res.send('No name specified for dataset') }
    // Add option checking for querying dataset data

    // Check if dataset exists

    // Get data for the dataset

    res.send('GET /dataset')
})

app.post('/dataset', (req, res) => {
    if (req.body == undefined) { return res.send('No body specified') }
    if (req.body.name == undefined) { return res.send('No name specified for dataset') }
    if (req.body.structure == undefined) { return res.send('No structure specified for dataset') }
    if (!Array.isArray(req.body.structure)) { return res.send('\'structure\' must be an array') }
    if (!req.body.structure.length) { return res.send('No data specified for dataset in \'structure\'') }

    var data = {};
    for (let i = 0; i < req.body.structure.length; i++) {
        var dataName = req.body.structure[i].dataName;
        var dataType = req.body.structure[i].dataType;
        if (dataName == undefined || dataType == undefined) {
            return res.send('Objects in \'structure\' must supply a \'dataName\' and \'dataType\' field')
        }
        if (data[dataName] != undefined) {
            return res.send(`Multiple data objects specified for \'${dataName}\'`)
        }
        if (dataType != 'number' && dataType != 'string' && dataType != 'time') {
            return res.send('Data types must be one of the following: \'number\', \'string\', \'time\'')
        }
        data[dataName] = { dataName, dataType }
    }

    // Check if dataset already exists

    // Create the dataset; Add document to 'datasets' collection and create collection for data

    res.send('POST /dataset')
})

app.put('/dataset', (req, res) => {
    if (req.body == undefined) { return res.send('No body specified') }
    if (req.body.name == undefined) { return res.send('No name specified for dataset') }
    if (req.body.data == undefined) { return res.send('No data specified to add to dataset') }
    if (!Array.isArray(req.body.data)) { return res.send('\'data\' must be an array') }
    if (!req.body.data.length) { return res.send('No data specified to add to dataset') }

    // Get the structure of the dataset

    // Check that each data object to be added matches the structure

    res.send('PUT /dataset')
})

app.delete('/dataset', (req, res) => {
    if (req.body == undefined) { return res.send('No body specified') }
    if (req.body.name == undefined) { return res.send('No name specified for dataset') }

    // Delete collection and the document in 'datasets' for the given name

    res.send('DELETE /dataset')
})

module.exports = app
