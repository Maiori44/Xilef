const { Commands, Command } = require('../commands.js');
const { Buttons } = require('../constants.js');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

Commands.info = new Command("Shows info about the bot and this server's prefix", (message, args) => {
    message.channel.send({
        embeds: [
            new MessageEmbed()
                .setColor("#0368f8")
                .setTitle("Xilef info")
                .setDescription("Bot created by <@621307633718132746>\nYou can check out the code on github")
                .addField("This server's prefix:", "`" + Prefix.get(message.guild.id) + "`")
                .setTimestamp()
        ],
        components: [Buttons]
    })
}, "Utility")