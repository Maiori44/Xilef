const { LocalClient } = require('./client.js')
const { Intents } = require('discord.js')

require('./economy.js')
require('./logger.js')

const client = new LocalClient(
    [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ]
<<<<<<< HEAD
)

client.start(client.debugging ? process.env.DEBUG : process.env.TOKEN)
=======
})
client.login(debugmode ? process.env.DEBUG : process.env.TOKEN)
client.prefix = debugmode ? "beta&" : "&"

Time = {
    day: 86400000,
    hour: 3600000,
    minute: 60000,
    second: 1000,
    convertTime(time) {
        if (time < Time.second) return time + " milliseconds"
        else if (time < Time.minute) return (Math.floor(time / Time.second)) + " seconds"
        else if (time < Time.hour) return (Math.floor(time / Time.minute)) + " minutes"
        else if (time < Time.day) return (Math.floor(time / Time.hour)) + " hours"
        else return (Math.floor(time / Time.day)) + " days"
    }
}

class Colorizer {
    constructor(color) {
        this.color = color
    }

    colorize(text) {
        return this.color + text + Colors.white.color + Colors.hblack.color
    }
}

Colors = {
    white: new Colorizer("\033[97m"),
    green: new Colorizer("\x1B[92m"),
    red: new Colorizer("\x1B[31m"),
    blue: new Colorizer("\x1B[34m"),
    yellow: new Colorizer("\x1B[33m"),
    purple: new Colorizer("\x1B[35m"),
    cyan: new Colorizer("\x1B[36m"),
    hblack: new Colorizer("\x1B[40m"),
    hred: new Colorizer("\x1B[41m"),
    hgreen: new Colorizer("\x1B[42m"),
    hyellow: new Colorizer("\x1B[43m"),
    hblue: new Colorizer("\x1B[44m"),
    hpurple: new Colorizer("\x1B[45m"),
    hcyan: new Colorizer("\x1B[46m"),
}

GetPercentual = () => {
    return Math.floor(Math.random() * 101)
}

warning = debugmode ? "This bot is running in debug mode, no changes will be saved" : undefined

require("./economy.js")
require("./commands.js")
require("./parsers.js")
require("./buttons.js")
require("./minigames.js")
require('./developer')

client.on("ready", (message) => {
    console.log("- Bot ready")
    if (debugmode) console.log("- " + Colors.yellow.colorize("The current bot session is running in debug mode, no data will be saved"))
    client.user.setActivity("ping me for help")
})
client.on("messageCreate", (message) => {
    if (message.author.bot) return
    if (message.guild === null) {
        message.author.send("I can't answer command calls from DMs, join my official server for that!\nhttps://discord.gg/Qyz5HgrxWg")
        console.error("- " + Colors.blue.colorize("Potential command call ended due to call being in a Direct Message:") +
            "\n\tMessage: " + message.content +
            "\n\tCalled at: " + new Date() +
            "\n\tCaller: " + message.author.username)
        return
    }

    const prefix = Prefix.get(message.guild.id)

    if (message.content.trim() == "<@!" + client.user.id + ">" || message.content.trim() == "<@" + client.user.id + ">") {
        Commands.info.action(message); return;
    }

    if (!message.content.startsWith(prefix)) return;

    function handler(message) {
        let start = Date.now()
        // create a regular expresion that matches either any string inside of doublequotes,   or any string without spaces that is outside of double quotes
        let regex = /"([^"]*?)"|[^ ]+/gm
        // make the output of .matchAll into an array, since .matchAll returns an iterator
        // then map each value (an array that contains strings or null) into a singlestring
        // index 0 being the full match, and the rest being the capturing groups
        let args = [...message.content.matchAll(regex)]
            .map(el => el[1] || el[0] || "")
        let command = args.shift()
        command = command ? command.toLowerCase() : undefined
        if (command == "") {
            message.channel.send('Wow great command, " ", makes complete sense');
            return;
        } else if (Commands[command]) {
            try {
                Commands[command.toLowerCase()].call(message, args);
                if (!debugmode) {
                    Economy.save();
                } else console.log("- " + Colors.blue.colorize("Update of ") + Colors.hblue.colorize("economy.json") + Colors.blue.colorize(" was cancelled due to debug mode being active"));
                if (warning) {
                    message.channel.send({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setColor("#ff0000")
                                .setTitle("Warning")
                                .setDescription(warning)
                                .setTimestamp()
                        ]
                    });
                }
                console.log("- " + Colors.green.colorize("Command call completed sucessfully:") +
                    "\n\tCommand: " + command +
                    "\n\tArgs: " + args +
                    "\n\tTime taken: " + (Date.now() - start) +
                    "\n\tCalled at: " + new Date() +
                    "\n\tCaller: " + message.author.username +
                    "\n\tChannel name: " + message.channel.name +
                    "\n\tGuild name: " + message.guild.name);
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
                        "\n\tError: " + errormsg.stack);
                    message.channel.send(errormsg.toString().slice(0, 1900));
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
                        "\n\tArgument name: " + errormsg.name);
                    const ErrorEmbed = new Discord.MessageEmbed()
                        .setColor("blurple")
                        .setTitle("Missing argument " + (errormsg.num + 1) + "!")
                        .setDescription(errormsg.msg.toString().slice(0, 1900))
                        .setTimestamp()
                        .setFooter("Missing argument name: " + errormsg.name)
                    message.channel.send({
                        embeds: [ErrorEmbed]
                    })
                } else if (errormsg == "Only my developers can use this command") {
                    console.error("- " + Colors.blue.colorize("Command call aborted due to the user not being a developer:") +
                        "\n\tCommand: " + command +
                        "\n\tArgs: " + args +
                        "\n\tTime taken: " + (Date.now() - start) +
                        "\n\tCalled at: " + new Date() +
                        "\n\tCaller: " + message.author.username +
                        "\n\tChannel name: " + message.channel.name +
                        "\n\tGuild name: " + message.guild.name);
                    message.channel.send(errormsg);
                } else {
                    console.error("- " + Colors.yellow.colorize("Command call ended by thrown error:") +
                        "\n\tCommand: " + command +
                        "\n\tArgs: " + args +
                        "\n\tTime taken: " + (Date.now() - start) +
                        "\n\tCalled at: " + new Date() +
                        "\n\tCaller: " + message.author.username +
                        "\n\tChannel name: " + message.channel.name +
                        "\n\tGuild name: " + message.guild.name +
                        "\n\tError: " + errormsg);
                    message.channel.send(errormsg.toString().slice(0, 1900));
                }
            }
        } else if (aliases.get(message.author.id)?.[command]) {
            const replaced = message.content
                .replace(command, aliases.get(message.author.id)[command])

            message.channel.send(`Parsed to: ${message.content
                .replace(command, '**' + aliases.get(message.author.id)[command] + '**')}`)

            handler(Object.assign(message, {content: replaced}))
        } else {
            message.channel.send(`That command doesn't exist buddy, use \`${prefix}help\` for a list of commands`)
        }
    }
    handler(Object.assign(message, { content: message.content.slice(prefix.length) }))
})
>>>>>>> master
