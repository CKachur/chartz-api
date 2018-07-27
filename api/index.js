var express = require('express')
var bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

var mongo = require('../mongo')

function checkDataType(data, dataType) {
    var t = typeof(data)
    switch (dataType) {
        case 'number':
        case 'time':
            if (t == 'number') return true
            break
        case 'string':
            if (t == 'string') return true
            break
        default:
            return false
    }
    return false
}

app.get('/dataset', (req, res) => {
    if (req.body == undefined) { return res.send('No body specified') }
    if (req.body.name == undefined) { return res.send('No name specified for dataset') }
    // Add options for querying dataset data

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

    var data = {}
    for (let i = 0; i < req.body.structure.length; i++) {
        var dataName = req.body.structure[i].dataName
        var dataType = req.body.structure[i].dataType
        if (dataName == undefined || dataType == undefined) {
            return res.send('Objects in \'structure\' must supply a \'dataName\' and \'dataType\' field')
        }
        if (dataName == 'timestamp') {
            return res.send('Cannot name data field \'timestamp\'')
        }
        if (data[dataName] != undefined) {
            return res.send(`Multiple data objects specified for \'${dataName}\'`)
        }
        if (dataType != 'number' && dataType != 'string') {
            return res.send('Data types must be one of the following: \'number\', \'string\'')
        }
        data[dataName] = { dataName, dataType }
    }
    data['timestamp'] = { 'dataName': 'timestamp', 'dataType': 'time' }
    var dataArray = []
    Object.keys(data).map((key) => { dataArray.push(data[key]) })

    mongo.checkIfDatasetExists(req.body.name, (err, datasetExists) => {
        if (err) { return res.send(err) }
        if (datasetExists) { return res.send(`\'${req.body.name}\' dataset already exists`) }

        mongo.createDataset(req.body.name, dataArray, (err, createdDataset) => {
            if (err) { return res.send(err) }
            if (!createdDataset) { return res.send('Couldn\'t create dataset') }
            res.send('POST /dataset successful')
        })
    })
})

app.put('/dataset', (req, res) => {
    if (req.body == undefined) { return res.send('No body specified') }
    if (req.body.name == undefined) { return res.send('No name specified for dataset') }
    if (req.body.data == undefined) { return res.send('No data specified to add to dataset') }
    if (!Array.isArray(req.body.data)) { return res.send('\'data\' must be an array') }
    if (!req.body.data.length) { return res.send('No data specified to add to dataset') }

    mongo.getDatasetStructure(req.body.name, (err, structure) => {
        if (err) { return res.send(err) }
        if (structure == null || !structure.length) { return res.send('Couldn\'t get structure of dataset') }

        var incomingData = req.body.data
        for (let i = 0; i < incomingData.length; i++) {
            for (let j = 0; j < structure.length; j++) {
                if (structure[j].dataName == 'timestamp' && (incomingData[i])['timestamp'] == undefined) {
                    (incomingData[i])['timestamp'] = Date.now()
                }
                var dataPiece = (incomingData[i])[structure[j].dataName]

                if (dataPiece == undefined) {
                    return res.send(`Need to specify data attribute \'${structure[j].dataName}\'`)
                }
                if (!checkDataType(dataPiece, structure[j].dataType)) {
                    return res.send(`Data type mismatch for attribute \'${structure[j].dataName}\'`)
                }
            }
        }

        mongo.addDataToDataset(req.body.name, incomingData, (err, addedData) => {
            if (err) { return res.send(err) }
            if (!addedData) { return res.send('Could not add data to dataset') }
            res.send('PUT /dataset successful')
        })
    })
})

app.delete('/dataset', (req, res) => {
    if (req.body == undefined) { return res.send('No body specified') }
    if (req.body.name == undefined) { return res.send('No name specified for dataset') }

    mongo.deleteDataset(req.body.name, (err, deletedDataset) => {
        if (err) { return res.send(err) }
        if (!deletedDataset) { return res.send('Couldn\'t delete dataset') }
        res.send('DELETE /dataset successful')
    })
})

module.exports = app
