require("dotenv").config()
Discord = require("discord.js")

client = new Discord.Client()
client.login(process.env.TOKEN)

const prefix = "&"

Date.day = 86400000
Date.hour = 3600000

GetPercentual = () => {
    return Math.floor(Math.random() * 101)
}

warning = undefined

require("./economy.js")
require("./commands.js")
require("./buttons.js")
require("./minigames.js")

client.on("ready", () => {
    console.log("- Bot ready")
    client.user.setActivity("prefix is &")
})
client.on("message", (message) => {
    let start = Date.now()
    if (message.author.bot) return
    if (message.content.startsWith(prefix)) {
        // create a regular expresion that matches either any string inside of double quotes, or any string without spaces that is outside of double quotes
        let regex = /"([^"]*?)"|[^ ]+/gm
        // make the output of .matchAll into an array, since .matchAll returns an iterator
        // then map each value (an array that contains strings or null) into a single string
        // index 0 being the full match, and the rest being the capturing groups
        let args = [...message.content.slice(prefix.length).matchAll(regex)]
            .map(el => el[1] || el[0] || "")
        let command = args.shift().toLowerCase()
        if (command == "") {
            message.channel.send('Wow great command, " ", makes complete sense')
            return
        } else if (Commands[command]) {
            try {
                Commands[command.toLowerCase()].call(message, args)
                Economy.save()
                if (warning) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setColor("#ff0000")
                        .setTitle("Warning")
                        .setDescription(warning)
                        .setTimestamp())
                }
                console.log("- \x1B[92mCommand call completed sucessfully:\033[97m" +
                    "\n\tCommand: " + command +
                    "\n\tArgs: " + args +
                    "\n\tTime taken: " + (Date.now() - start) +
                    "\n\tCalled at: " + new Date() +
                    "\n\tCaller: " + message.author.username +
                    "\n\tChannel name: " + message.channel.name +
                    "\n\tGuild name: " + message.guild.name)
            } catch (errormsg) {
                if (errormsg instanceof Error)
                    console.error("- \x1B[31mCommand call ended by thrown error:\033[97m" +
                        "\n\tCommand: " + command +
                        "\n\tArgs: " + args +
                        "\n\tTime taken: " + (Date.now() - start) +
                        "\n\tCalled at: " + new Date() +
                        "\n\tCaller: " + message.author.username +
                        "\n\tChannel name: " + message.channel.name +
                        "\n\tGuild name: " + message.guild.name +
                        "\n\tError: " + errormsg.stack)
                message.channel.send(errormsg.toString().slice(0, 1900))
            }
        } else {
            message.channel.send("That command doesn't exist buddy, use `&help` for a list of commands")
        }
    }
})