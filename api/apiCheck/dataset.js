module.exports.checkDataType = (data, dataType) => {
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
