require('dotenv').config()
const fs = require('fs')
const Logger = require('logplease')

const _debugging = process.argv[2] == "-debug"

const economyLogger = Logger.create("economy", { 
    color: Logger.Colors.Cyan
})
const clientLogger = Logger.create("client", {
    color: Logger.Colors.Green
})
const eventLogger = Logger.create("event", {
    color: Logger.Colors.Blue
})

fs.stat('./src/data/logs', (err, stat) => {
    if (stat.size > 4096) {
        fs.rmdirSync('./src/data/logs', { force: true })
        fs.mkdirSync('./src/data/logs')
    }
})
Logger.setLogfile('./src/data/logs/' + new Date().toString())
Logger.setLogLevel(_debugging ? Logger.LogLevels.DEBUG : Logger.LogLevels.INFO)

economyLogger.info("started up economy logger")
clientLogger.info("started up client logger")
eventLogger.info("started up event logger")

module.exports = {
    economyLogger,
    clientLogger,
    eventLogger
}