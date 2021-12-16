const { Command } = require('../command.js')

module.exports = new Command({
    name: "test",
    description: "test",
    async run(message, args, client) {
        message.channel.send("test")
    }
})