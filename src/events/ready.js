const { Event } = require('../event.js')
const { eventLogger } = require('../constants.js')

module.exports = new Event("ready", client => {
    if (client.debugging) eventLogger.warn("The bot is in debug mode, changes are not to be saved.")
    eventLogger.info("client is ready!")
})