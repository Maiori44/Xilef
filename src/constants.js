const Logger = require('logplease')

const economyLogger = Logger.create("economy", { color: Logger.Colors.Magenta, useColors: false, logLevel: Logger.LogLevels.DEBUG })
const clientLogger = Logger.create("client", { logLevel: Logger.LogLevels.INFO })

economyLogger.info("started up economy logger")
clientLogger.info("started up client logger")

module.exports = {
    economyLogger,
    clientLogger
}