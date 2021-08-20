require("dotenv").config()
Discord = require("discord.js")

debugmode = process.argv[2] == "-debug" ? true : false

client = new Discord.Client()
client.login(debugmode ? process.env.DEBUG : process.env.TOKEN)
client.prefix = debugmode ? "beta&" : "&"

Date.day = 86400000
Date.hour = 3600000

class Colorizer {
    constructor(color) {
        this.color = color
    }

    colorize(text) {
        return this.color + text + Colors.white.color
    }
}

Colors = {
    white: new Colorizer("\033[97m"),
    green: new Colorizer("\x1B[92m"),
    red: new Colorizer("\x1B[31m"),
    blue: new Colorizer("\x1B[34m"),
    yellow: new Colorizer("\x1B[33m"),
    purple: new Colorizer("\x1B[35m"),
    cyan: new Colorizer("\x1B[36m")
}

GetPercentual = () => {
    return Math.floor(Math.random() * 101)
}

warning = debugmode ? "This bot is running in debug mode, no changes will be saved" : undefined

require("./economy.js")
require("./commands.js")
require("./prefix.js")
require("./buttons.js")
require("./minigames.js")

client.on("ready", () => {
    console.log("- Bot ready")
    if (debugmode) console.log("- " + Colors.yellow.colorize("The current bot session is running in debug mode, no data will be saved"))
    client.user.setActivity("ping me for info")
})
client.on("message", (message) => {
    if (message.content.trim() == "<@!" + client.user.id + ">") { Commands.info.action(message); return }
    const prefix = Prefix.get(message.guild.id)
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
        let command = args.shift()
        command = command ? command.toLowerCase() : undefined
        if (command == "") {
            message.channel.send('Wow great command, " ", makes complete sense')
            return
        } else if (Commands[command]) {
            try {
                Commands[command.toLowerCase()].call(message, args)
                if (!debugmode) {
                    Economy.save()
                } else console.log("- " + Colors.blue.colorize("Update of \"economy.json\" was cancelled due to debug mode being active"))
                if (warning) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setColor("#ff0000")
                        .setTitle("Warning")
                        .setDescription(warning)
                        .setTimestamp())
                }
                console.log("- " + Colors.green.colorize("Command call completed sucessfully:") +
                    "\n\tCommand: " + command +
                    "\n\tArgs: " + args +
                    "\n\tTime taken: " + (Date.now() - start) +
                    "\n\tCalled at: " + new Date() +
                    "\n\tCaller: " + message.author.username +
                    "\n\tChannel name: " + message.channel.name +
                    "\n\tGuild name: " + message.guild.name)
            } catch (errormsg) {
                if (errormsg instanceof Error) {
                    console.error("- " + Colors.red.colorize("Command call ended by JavaScript error:") +
                        "\n\tCommand: " + command +
                        "\n\tArgs: " + args +
                        "\n\tTime taken: " + (Date.now() - start) +
                        "\n\tCalled at: " + new Date() +
                        "\n\tCaller: " + message.author.username +
                        "\n\tChannel name: " + message.channel.name +
                        "\n\tGuild name: " + message.guild.name +
                        "\n\tError: " + errormsg.stack)
                    message.channel.send(errormsg.toString().slice(0, 1900))
                } else if (typeof errormsg == "object") {
                    console.error("- " + Colors.blue.colorize("Command call ended by missing argument:") +
                        "\n\tCommand: " + command +
                        "\n\tArgs: " + args +
                        "\n\tTime taken: " + (Date.now() - start) +
                        "\n\tCalled at: " + new Date() +
                        "\n\tCaller: " + message.author.username +
                        "\n\tChannel name: " + message.channel.name +
                        "\n\tGuild name: " + message.guild.name +
                        "\n\tArgument number: " + errormsg.num +
                        "\n\tArgument name: " + errormsg.name)
                    message.channel.send(errormsg.msg.toString().slice(0, 1900))
                } else {
                    console.error("- " + Colors.yellow.colorize("Command call ended by thrown error:") +
                        "\n\tCommand: " + command +
                        "\n\tArgs: " + args +
                        "\n\tTime taken: " + (Date.now() - start) +
                        "\n\tCalled at: " + new Date() +
                        "\n\tCaller: " + message.author.username +
                        "\n\tChannel name: " + message.channel.name +
                        "\n\tGuild name: " + message.guild.name +
                        "\n\tError: " + errormsg)
                    message.channel.send(errormsg.toString().slice(0, 1900))
                }
            }
        } else {
            message.channel.send(`That command doesn't exist buddy, use \`${prefix}help\` for a list of commands`)
        }
    }
})
