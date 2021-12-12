const { Commands, Command, RequiredArg } = require('../commands.js');
const { Prefix, Buttons } = require('../constants.js');
const { MessageEmbed } = require('discord.js');

Commands.help = new Command("Shows a list of all commands or detailed info of a specific command, if given its name", (message, args) => {
    args[0] = args[0] ? args[0].toLowerCase() : undefined
    if (args[0] && Commands[args[0]]) {
        const CommandInfoEmbed = new MessageEmbed()
            .setColor("#0368f8")
            .setTitle(args[0])
            .setDescription(Commands[args[0]].description.replace(/\&/g, Prefix.get(message.guild.id)))
            .setTimestamp()
            .setFooter(Object.keys(Commands).length + " total commands")
        let syntax = `\`${Prefix.get(message.guild.id)}` + args[0]
        if (Commands[args[0]].requiredargs) {
            for (const arg of Commands[args[0]].requiredargs) {
                syntax = syntax + " " + (arg.notrequired ? "[" : "(") + arg.name + (arg.notrequired ? "]" : ")")
            }
        }
        syntax = syntax + "`"
        CommandInfoEmbed.addField("Syntax:", "arguments inside () are required, arguments inside [] can be omitted\narguments can have spaces using \" at the start and end of the argument\n" + syntax)
        let button
        if (Commands[args[0]].link) {
            button = new MessageButton()
                .setStyle("LINK")
                .setURL(Commands[args[0]].link)
                .setLabel(Commands[args[0]].category == "Game" ? "How to play" : "Github page")
        }
        message.channel.send({
            embeds: [CommandInfoEmbed],
            components: [
                new MessageActionRow({ components: [button] })
            ]
        });
        return
    }
    const CommandsEmbed = new MessageEmbed()
        .setColor("#0368f8")
        .setTitle("List of all commands:")
        .setDescription(`You can do \`${Prefix.get(message.guild.id)}help (command name)\` to have a brief description of the command`)
        .setTimestamp()
        .setFooter(Object.keys(Commands).length + " total commands")
    let Categories = {}
    for (let key in Commands) {
        if (!Commands[key].category) continue
        if (!Categories[Commands[key].category]) {
            Categories[Commands[key].category] = []
        }
        Categories[Commands[key].category].push(key)
    }
    for (let category in Categories) {
        CommandsEmbed.addField(category + " commands", "`" + Categories[category].join("` `") + "`", true)
    }
    message.channel.send({ embeds: [CommandsEmbed], components: [Buttons]})
}, "Utility", [new RequiredArg(0, undefined, "command name", true)])