const { Command } = require('../command.js')

module.exports = [
    new Command({
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
    }),
    new Command({
        name: "clown",
        description: "Given a person or a thing, the bot will say how much of a clown it is",
        category: "Math",
        async run(message, args, client) {
            let name = args[0] || message.author.username
            let clownvalue = name.length + (Date.now() % 50)
            for (var i = 0; i < name.length; i++) {
                clownvalue = clownvalue + name.charCodeAt(i)
            }
            clownvalue = (clownvalue % 1000) / 10
            message.channel.send(name + " is a clown at " + clownvalue + "%")
            switch (Math.floor(clownvalue)) {
                case 0:
                    message.channel.send("Wow, " + name + " is not a clown, " + name + " is an absolute chad")
                    break
                case 69:
                    message.channel.send("Noice.")
                    break
                case 99:
                    message.channel.send("Wow, " + name + " is not a clown, " + name + " is the entire circus")
                    break
            }
        }
    })
]