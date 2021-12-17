const { Command } = require('../command.js')

module.exports = new Command({
    name: "dice",
    description: "Gives you a number from 1 to 6 and maybe judges your result",
    category: "Math",
    async run(message) {
        let randomnum = Math.ceil(Math.random() * 6)
        message.channel.send(message.author.username + " rolled " + randomnum)
        switch (randomnum) {
            case 1:
                message.channel.send("boy you suck")
                break
            case 6:
                message.channel.send("damn u lucky")
                break
        }
    }
})