const { Command, RequiredArg } = require('../command.js')
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { run } = require('../events/messageCreate.js');

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
})

module.exports = [
    new Command({
        name: "help",
        description: "Shows a list of all commands or detailed info of a specific command, if given its name",
        category: "Utility",
        async run(message, args, client) {
            function getCmdData(command, parentName) {
                if (!parentName) parentName = ""
                else parentName += " "

                return client.prefix + parentName + command.name +
                    command.requiredArgs
                        .sort((a, b) => a.valueIndex - b.valueIndex)
                        .map(arg =>
                            ` <${arg.argName}${arg.validValues.length > 0
                                ? ` (can be: \`${arg.validValues.join(', ')}\`)`
                                : ''
                            }> `)
            }

            if (args[0]) {
                const requestedCommand = client.commands.get(args[0])

                if (requestedCommand) {
                    const commandDataEmbed = new MessageEmbed()
                        .setTitle(requestedCommand.name)
                        .setDescription(`"${requestedCommand.description}"`)
                        .addFields({
                            name: "Syntax",
                            value: getCmdData(requestedCommand)
                        }, {
                            name: "Subcommands",
                            value: requestedCommand.subCommands == undefined || requestedCommand.subCommands.length == 0
                                ? "This command does not have any subcommands."
                                : requestedCommand.subCommands.map(cmd => getCmdData(cmd, requestedCommand.name)).join('\n')
                        }, {
                            name: "Category",
                            value: requestedCommand.category ?? "No category specified."
                        }, {
                            name: "General syntax",
                            value: "- Arguments inside `[]` can be ommited; \n- Arguments inside `<>` must be added or the command will not execute; \n- Arguments can only have spaces if you put them between __double quote marks__ \"like this\" \n"
                        })
                        .setTimestamp()
                        .setFooter(client.commands.size + " total commands")
                    message.channel.send({ embeds: [commandDataEmbed] })
                } else {
                    message.reply("That command does not exist! Use `help` without arguments at all to get a list of ")
                }
            } else {

            }
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
    }),
    new Command({
        name: "sleep",
        description: "Tests the bot asynchronous command handling \nThe command won't block the main thread but since you are technically 'running' a command, any inputs of yours will be ignored.",
        category: "Utility",
        requiredArgs: [
            new RequiredArg({
                argName: "time",
                argIndex: 0,
                errorMsg: "You need to specify a valid time (in seconds, from one to ten) to sleep for.",
                validValues: [...Array(10).keys()].map(t => (t + 1).toString())
            })
        ],
        subCommands: [
            new Command({
                name: "milliseconds",
                description: "Allows you to use milliseconds instead of seconds.",
                category: "Utility",
                requiredArgs: [
                    new RequiredArg({
                        argName: "ms",
                        argIndex: 0,
                        errorMsg: "You need to specify a valid time (in milliseconds, may not exceed 10'000)",
                    })
                ],
                async run(message, args, client) {
                    if (parseInt(args[0]) > 10000) throw "You need to specify a value below or equal to 10000!"
                    await new Promise(resolve => setTimeout(() => resolve(message.reply("Ended sleep")), parseInt(args[0])))
                }
            })
        ],
        async run(message, args, client) {
            await new Promise(resolve => setTimeout(() => resolve(message.reply("Ended sleep")), parseInt(args[0]) * 1000));
        }
    })
]