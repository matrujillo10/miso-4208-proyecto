var path = require('path')

const splitFilename = function(filename) {
    return {
        name: path.parse(filename).name,
        ext: path.parse(filename).ext
    };
}

module.exports = splitFilename;