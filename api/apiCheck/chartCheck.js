var mongo = require('../../mongo').datasets

function checkBarGraph(chart, structure) {
    if (chart.xAxis == undefined || chart.xAxis.dataName == undefined) {
        return null
    }
    if (chart.yAxis == undefined || !Array.isArray(chart.yAxis) || !chart.yAxis.length) {
        return null
    }

    var data = {}
    for (let i = 0; i < structure.length; i++) {
        data[structure[i].dataName] = structure[i].dataType
    }

    var xAxisClean = {}
    var yAxisClean = []
    if (data[chart.xAxis.dataName] == 'string') {
        xAxisClean['dataName'] = chart.xAxis.dataName

        for (let i = 0; i < chart.yAxis.length; i++) {
            var yData = data[chart.yAxis[i].dataName]
            if (yData == undefined || yData != 'number') {
                return null
            }
            if (chart.yAxis[i].aggregateBy != 'sum' && chart.yAxis[i].aggregateBy != 'count') {
                return null
            }
            yAxisClean.push({ dataName: chart.yAxis[i].dataName, aggregateBy: chart.yAxis[i].aggregateBy })
        }
    } else if (data[chart.xAxis.dataName] == 'number') {
        if (chart.xAxis.buckets == undefined || !Array.isArray(chart.xAxis.buckets) || !chart.xAxis.buckets.length) {
            return null
        }
        var bucketsClean = []
        for (let i = 0; i < chart.xAxis.buckets.length; i++) {
            var bucket = chart.xAxis.buckets[i]
            if (bucket.bottomBound == undefined || bucket.topBound == undefined || isNaN(bucket.bottomBound) || isNaN(bucket.topBound)) {
                return null
            }
            bucketsClean.push({ bottomBound: bucket.bottomBound, topBound: bucket.topBound })
        }
        xAxisClean['dataName'] = chart.xAxis.dataName
        xAxisClean['buckets'] = bucketsClean

        for (let i = 0; i < chart.yAxis.length; i++) {
            var yData = data[chart.yAxis[i].dataName]
            if (yData == undefined || yData != 'number') {
                return null
            }
            yAxisClean.push({ dataName: chart.yAxis[i].dataName })
        }
    } else {
        return null
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
    if (chart.xAxis == undefined || typeof(chart.xAxis) != 'string') {
        return null
    }
    if (chart.yAxis == undefined || !Array.isArray(chart.yAxis) || !chart.yAxis.length) {
        return null
    }

    var data = {}
    for (let i = 0; i < structure.length; i++) {
        data[structure[i].dataName] = structure[i].dataType
    }

    if (data[chart.xAxis] == undefined || data[chart.xAxis] != 'number') {
        return null
    }
    for (let i = 0; i < chart.yAxis.length; i++) {
        if (data[chart.yAxis[i]] == undefined || data[chart.yAxis[i]] != 'number') {
            return null
        }
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
    if (chart.yAxis == undefined || !Array.isArray(chart.yAxis) || !chart.yAxis.length) {
        return null
    }

    var data = {}
    for (let i = 0; i < structure.length; i++) {
        data[structure[i].dataName] = structure[i].dataType
    }

    for (let i = 0; i < chart.yAxis.length; i++) {
        if (data[chart.yAxis[i]] == undefined) { return null }
        if (data[chart.yAxis[i]] != 'number') { return null }
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
            return null
    }
}
