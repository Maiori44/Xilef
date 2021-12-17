const { Command } = require('../command.js')
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')

const Buttons = new MessageActionRow({
    components: [
        new MessageButton()
            .setStyle("LINK")
            .setURL("https://github.com/Felix-44/Xilef")
            .setLabel("Github page"),
        new MessageButton()
            .setStyle("LINK")
            .setURL("https://discord.gg/Qyz5HgrxWg")
            .setLabel("Official server"),
        new MessageButton()
            .setStyle("LINK")
            .setURL("https://discord.com/api/oauth2/authorize?client_id=852882606629847050&permissions=275415091200&scope=bot")
            .setLabel("Invite bot"),
    ]
});

module.exports = [
    new Command({
        name: "help",
        description: "Shows a list of all commands or detailed info of a specific command, if given its name",
        category: "Utility",
        async run(message, args, client) {
            args[0] = args[0] ? args[0].toLowerCase() : undefined
            if (args[0] && client.commands.has(args[0])) {
                const targetCommand = client.commands.get(args[0])

                const CommandInfoEmbed = new MessageEmbed()
                    .setColor("#0368f8")
                    .setTitle(args[0])
                    .setDescription(targetCommand.description.replace(/\&/g, client.prefix)) // TODO : implement guild-based prefixes
                    .setTimestamp()
                    .setFooter(client.commands.size + " total commands")

                let syntax = `\`${client.prefix}` + args[0]

                // if (Commands[args[0]].requiredargs) {
                //     for (const arg of Commands[args[0]].requiredargs) {
                //         syntax = syntax + " " + (arg.notrequired ? "[" : "(") + arg.name + (arg.notrequired ? "]" : ")")
                //     }
                // }

                syntax += "`"

                CommandInfoEmbed.addField("Syntax : ", "arguments inside () are required, arguments inside [] can be omitted\narguments can have spaces using \" at the start and end of the argument\n" + syntax)

                let button

                if (targetCommand.link) {
                    button
                        .setStyle("LINK")
                        .setURL(targetCommand.link)
                        .setLabel(targetCommand.category == "Game" ? "How to play" : "Github Page")
                }

                message.channel.send({
                    embeds: [CommandInfoEmbed],
                    components: (button == undefined) ? [] : [new MessageActionRow({ components: [button] })]
                })

                return
            }

            const CommandsEmbed = new MessageEmbed()
                .setColor("#0368f8")
                .setTitle("List of all commands:")
                .setDescription(`You can do \`${client.prefix}help (command name)\` to have a brief description of the command`)
                .setTimestamp()
                .setFooter(client.commands.size + " total commands")

            let categories = {}

            client.commands.forEach((cmd, index) => {

                if (!cmd.category)
                    return
                if (!categories[cmd.category]) {
                    categories[cmd.category] = []
                }
                categories[cmd.category].push(cmd)
            })

            for (let category in categories) {
                CommandsEmbed.addField(category + " commands", "`" + categories[category].join("` `") + "`", true)
            }
            message.channel.send({ embeds: [CommandsEmbed], components: [Buttons] })
        }
    }),
    new Command({
        name: "info",
        description: "Shows info about the bot and this server's prefix",
        category: "Utility",
        async run(message, args, client) {
            const buttons = new MessageActionRow({
                components: [
                    new MessageButton()
                        .setStyle("LINK")
                        .setURL("https://github.com/Felix-44/Xilef")
                        .setLabel("Github page"),
                    new MessageButton()
                        .setStyle("LINK")
                        .setURL("https://discord.gg/Qyz5HgrxWg")
                        .setLabel("Official server"),
                    new MessageButton()
                        .setStyle("LINK")
                        .setURL("https://discord.com/api/oauth2/authorize?client_id=852882606629847050&permissions=275415091200&scope=bot")
                        .setLabel("Invite bot"),
                ]
            });
            message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor("#0368f8")
                        .setTitle("Xilef info")
                        .setDescription("Bot created by <@621307633718132746>\nYou can check out the code on github")
                        .addField("This server's prefix:", "`" + client.prefix + "`")
                        .setTimestamp()
                ],
                components: [buttons]
            })
        }
    })
]