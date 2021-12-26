require('dotenv').config()
const { Collection } = require("discord.js")

const parsedValues = {
    serializeAfter: 30,
    debugging: false,
    saveFilePath: './src/data/economy.bson',
    maxLogLevel: 'DEBUG'
}

const convertMap = {
    serializeAfter: function (arg) {
        const result = parseInt(arg)
        return isNaN(result) ? 30 : result
    },
    debugging: function (arg) {
        if (arg == 'true')
            return true
        else
            return false
    },
    helping: function () {
        console.log('Xilef, the funi bot.\n\n' +
            'Argument syntax: `argument=value` \n\n' +
            'Possible arguments: \n' +
            'help     : Displays this help message and exits. \n' +
            'safter   : (economy-related) Serializes after x changes. Defaults to 30. \n' +
            'debug    : Toggles debug mode.\n' +
            'loglvl   : The maximum log level. Can be : "NONE", "DEBUG", "INFO", "WARN" or "ERROR"\n' +
            'savePath : Where user data is supposed to be. Will always be overwritten, beware. '
        )

        process.exit(0)
    },
    saeFilePath: function (arg) {
        return arg
    },
    maxLogLevel: function (arg) {
        if (!['DEBUG', 'INFO', 'WARN', 'ERROR', 'NONE'].includes(arg))
            return 'INFO'
    }
}

/*
Arguments: 
-safter (max changes before serialization)
-help
-debug (toggle debug mode)
-save (savefile path)
 */
const argMap = new Map()
    .set('safter', 'serializeAfter')
    .set('debug', 'debugging')
    .set('help', 'helping')
    .set('savePath', 'saveFilePath')
    .set('loglvl', 'maxLogLevel')

let args = process.argv.slice(2)

// distribute args
args.forEach(arg => {
    const argCorrespondent = argMap.get(arg)
    const conversionResult = (convertMap[argCorrespondent] ?? (() => null))(arg.split('=')[1])
    if (argCorrespondent && conversionResult) {
        parsedValues[argCorrespondent] = conversionResult
    }
})

module.exports = {
    parsedValues
}