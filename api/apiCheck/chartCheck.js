var mongo = require('../../mongo').datasets

function checkBarGraph(chart, structure) {
    if (chart.xAxis == undefined) { return 'xAxis not defined' }
    if (chart.xAxis.dataName == undefined) { return 'xAxis dataName not defined' }
    if (chart.yAxis == undefined) { return 'yAxis not defined' }
    if (!Array.isArray(chart.yAxis)) { return 'yAxis must be an array' }
    if (!chart.yAxis.length) { return 'No data specified for yAxis' }

    var data = {}
    for (let i = 0; i < structure.length; i++) {
        data[structure[i].dataName] = structure[i].dataType
    }

    var xAxisClean = {}
    var yAxisClean = []
    if (data[chart.xAxis.dataName] == 'string') {
        xAxisClean['dataName'] = chart.xAxis.dataName

        for (let i = 0; i < chart.yAxis.length; i++) {
            if (data[chart.yAxis[i].dataName] == undefined) { return 'yAxis value does not exist in dataset' }
            if (data[chart.yAxis[i].dataName] != 'number') { return 'yAxis data must be of type number' }
            if (chart.yAxis[i].aggregateBy != 'sum' && chart.yAxis[i].aggregateBy != 'count') {
                return 'yAxis aggregateBy value must be one of the following: \'count\', \'sum\''
            }
            yAxisClean.push({ dataName: chart.yAxis[i].dataName, aggregateBy: chart.yAxis[i].aggregateBy })
        }
    } else if (data[chart.xAxis.dataName] == 'number') {
        if (chart.xAxis.buckets == undefined) { return 'xAxis buckets value not defined' }
        if (!Array.isArray(chart.xAxis.buckets)) { return 'xAxis buckets value must be an array' }
        if (!chart.xAxis.buckets.length) { return 'No buckets specified for xAxis' }

        var bucketsClean = []
        for (let i = 0; i < chart.xAxis.buckets.length; i++) {
            var bucket = chart.xAxis.buckets[i]
            if (bucket.bottomBound == undefined || bucket.topBound == undefined) {
                return 'bottomBound and topBound not specified for buckets'
            }
            if (isNaN(bucket.bottomBound) || isNaN(bucket.topBound)) {
                return 'bottomBound and topBound must be numbers'
            }
            bucketsClean.push({ bottomBound: bucket.bottomBound, topBound: bucket.topBound })
        }
        xAxisClean['dataName'] = chart.xAxis.dataName
        xAxisClean['buckets'] = bucketsClean

        for (let i = 0; i < chart.yAxis.length; i++) {
            if (data[chart.yAxis[i].dataName] == undefined) { return 'yAxis value does not exist in dataset' }
            if (data[chart.yAxis[i].dataName] != 'number') { return 'yAxis data must be of type \'number\'' }
            yAxisClean.push({ dataName: chart.yAxis[i].dataName })
        }
    } else {
        return 'Invalid data type for xAxis'
    }

    var cleanedChart = {
        name: chart.name,
        type: chart.type,
        dataset: chart.dataset,
        xAxis: xAxisClean,
        yAxis: yAxisClean
    }

    return cleanedChart
}

function checkLineGraph(chart, structure) {
    if (chart.xAxis == undefined) { return 'xAxis not defined' }
    if (typeof(chart.xAxis) != 'string') { return 'xAxis must be a dataset data name' }
    if (chart.yAxis == undefined) { return 'yAxis not defined' }
    if (!Array.isArray(chart.yAxis)) { return 'yAxis must be an array' }
    if (!chart.yAxis.length) { return 'No data specified for yAxis' }

    var data = {}
    for (let i = 0; i < structure.length; i++) {
        data[structure[i].dataName] = structure[i].dataType
    }

    if (data[chart.xAxis] == undefined) { return 'xAxis value does not exist in dataset' }
    if (data[chart.xAxis] != 'number') { return 'xAxis data must be of type \'number\'' }
    for (let i = 0; i < chart.yAxis.length; i++) {
        if (data[chart.yAxis[i]] == undefined) { return 'yAxis value does not exist in dataset' }
        if (data[chart.yAxis[i]] != 'number') { return 'yAxis data must be of type \'number\'' }
    }

    var cleanedChart = {
        name: chart.name,
        type: chart.type,
        dataset: chart.dataset,
        xAxis: chart.xAxis,
        yAxis: chart.yAxis
    }

    return cleanedChart
}

function checkLineGraphTime(chart, structure) {
    if (chart.yAxis == undefined) { return 'yAxis not defined' }
    if (!Array.isArray(chart.yAxis)) { return 'yAxis must be an array' }
    if (!chart.yAxis.length) { return 'No data specified for yAxis' }

    var data = {}
    for (let i = 0; i < structure.length; i++) {
        data[structure[i].dataName] = structure[i].dataType
    }

    for (let i = 0; i < chart.yAxis.length; i++) {
        if (data[chart.yAxis[i]] == undefined) { return 'yAxis value does not exist in dataset' }
        if (data[chart.yAxis[i]] != 'number') { return 'yAxis values must be of type \'number\'' }
    }

    var cleanedChart = {
        name: chart.name,
        type: chart.type,
        dataset: chart.dataset,
        yAxis: chart.yAxis
    }

    return cleanedChart
}

module.exports.checkChart = (chart, structure) => {
    switch (chart.type) {
        case 'barGraph':
            return checkBarGraph(chart, structure)
        case 'lineGraph':
            return checkLineGraph(chart, structure)
        case 'lineGraphTime':
            return checkLineGraphTime(chart, structure)
        default:
            return 'Chart type must be one of the following: \'barGraph\', \'lineGraph\', \'lineGraphTime\''
    }
}
