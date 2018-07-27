var mongo = require('../mongo').charts

module.exports.getChart = (req, res) => {
    if (req.query.name == undefined) { return res.send('No name specified for chart') }

    mongo.getChart(req.query.name, (err, result) => {
        if (err) { return res.send(err) }
        if (result == null) { return res.send('Could not find chart') }
        res.json(result)
    })
}

module.exports.postChart = (req, res) => {
    res.send('POST /chart')
}

module.exports.putChart = (req, res) => {
    res.send('PUT /chart')
}

module.exports.deleteChart = (req, res) => {
    if (req.body == undefined) { return res.send('No body specified') }
    if (req.body.name == undefined) { return res.send('No name specified for chart') }

    mongo.deleteChart(req.body.name, (err, deletedChart) => {
        if (err) { return res.send(err) }
        if (!deletedChart) { return res.send('Couldn\'t delete chart') }
        res.send('DELETE /chart successful')
    })
}
