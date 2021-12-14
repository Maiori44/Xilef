const { isDebugging, client, Colors } = require('../constants.js')

module.exports = () => {
    console.log("- Bot ready")
    if (isDebugging) console.log("- " + Colors.yellow.colorize("The current bot session is running in debug mode, no data will be saved"))
    client.user.setActivity("ping me for info")
}