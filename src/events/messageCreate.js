const { Prefix, Colors, Commands, isDebugging } = require('../constants.js')
const { MessageEmbed } = require('discord.js')
const warning = isDebugging ? "This bot is running in debug mode, no changes will be saved" : undefined;


module.exports = (client, message) => {
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
                if (!isDebugging) {
                    Economy.save();
                } else console.log("- " + Colors.blue.colorize("Update of ") + Colors.hblue.colorize("economy.json") + Colors.blue.colorize(" was cancelled due to debug mode being active"));
                if (warning) {
                    message.channel.send({
                        embeds: [
                            new MessageEmbed()
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
                    const ErrorEmbed = new MessageEmbed()
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

            handler(Object.assign(message, { content: replaced }))
        } else {
            message.channel.send(`That command doesn't exist buddy, use \`${prefix}help\` for a list of commands`)
        }
    }
    handler(Object.assign(message, { content: message.content.slice(prefix.length) }))
}