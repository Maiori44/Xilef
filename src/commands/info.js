const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')
const { Command } = require('../command.js')

module.exports = [new Command({
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
})]