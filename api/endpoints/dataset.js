var mongo = require('../../mongo').datasets
var apiCheck = require('../apiCheck').dataset

/*
 * Gets data from a specified dataset. If only startTime or endTime is
 * specified, it will look forward one day or backwards one day, respectively.
 * If Neither are specified it will retrieve data from one day back starting
 * at the current time
 *
 * Query Parameters:
 * name (required) - Name of the dataset to pull data from
 * startTime - Data before this time will not be pulled from dataset
 * endTime - Data after this time will not be pulled from dataset
 */
module.exports.getDataset = (req, res) => {
    if (req.query.name == undefined) { return res.send('No name specified for dataset') }

    mongo.checkIfDatasetExists(req.query.name, (err, datasetExists) => {
        if (err) { return res.send(err) }
        if (!datasetExists) { return res.send(`\'${req.query.name}\' dataset does not exist`) }

        var startTime
        var endTime
        if (req.query.startTime) { startTime = new Date(+req.query.startTime).getTime() }
        if (req.query.endTime) { endTime = new Date(+req.query.endTime).getTime() }

        if (startTime == undefined && endTime == undefined) {
            endTime = Date.now()
            startTime = endTime - (1000 * 60 * 60 * 24)
        } else if (startTime != undefined && endTime == undefined) {
            endTime = startTime + (1000 * 60 * 60 * 24)
        } else if (startTime == undefined && endTime != undefined) {
            startTime = endTime - (1000 * 60 * 60 * 24)
        }

        var options = { '$and': [
            { 'timestamp': { '$gte': startTime } },
            { 'timestamp': { '$lte': endTime } }
        ]}

        mongo.getDataFromDataset(req.query.name, options, (err, docs) => {
            if (err) { return res.send(err) }
            res.json({ data: docs })
        })
    })
}

/*
 * Creates a dataset, given the name specified is not an already existing
 * dataset.
 *
 * Body Parameters:
 * name (required) - Name of the dataset to create
 * structure (required) - Array containing objects specifying what data will
 *                        be in the dataset. Each one must specify a 'dataName'
 *                        and 'dataType'. Data names need to be unique in a
 *                        dataset and cannot be 'timestamp'. Data types must
 *                        be either 'number' or 'string'. Must specify at
 *                        least one data point.
 */
module.exports.postDataset = (req, res) => {
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
}

/*
 * Adds data to a dataset.
 *
 * Body Parameters:
 * name (required) - Name of the dataset to add data to
 * data (required) - Array of data objects to be added to the dataset. They
 *                   must supply the fields with correct types specified in the
 *                   structure of the dataset, besides 'timestamp'. If
 *                   'timestamp' is not specified it will be set to the current
 *                   time.
 */
module.exports.putDataset = (req, res) => {
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
                if (!apiCheck.checkDataType(dataPiece, structure[j].dataType)) {
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
}

/*
 * Deletes a dataset from the database.
 *
 * Body Parameters:
 * name (required) - name of the dataset to delete
 */
module.exports.deleteDataset = (req, res) => {
    if (req.body == undefined) { return res.send('No body specified') }
    if (req.body.name == undefined) { return res.send('No name specified for dataset') }

    mongo.deleteDataset(req.body.name, (err, deletedDataset) => {
        if (err) { return res.send(err) }
        if (!deletedDataset) { return res.send('Couldn\'t delete dataset') }
        res.send('DELETE /dataset successful')
    })
}
