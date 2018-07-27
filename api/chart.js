var mongo = require('../mongo')

module.exports.getChart = (req, res) => {
    res.send('GET /chart')
}

module.exports.postChart = (req, res) => {
    res.send('POST /chart')
}

module.exports.putChart = (req, res) => {
    res.send('PUT /chart')
}

module.exports.deleteChart = (req, res) => {
    res.send('DELETE /chart')
}
