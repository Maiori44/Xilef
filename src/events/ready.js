const { Event } = require('../event.js')
const { ColorMap } = require('../logger.js')

module.exports = new Event("ready", client => {
    client.logger._write("Client is now ready\n\n", "clientReady")
    if (client.debugging) client.logger.warning("The bot is in debug mode, changes are not to be saved.")
})