const { MessageEmbed } = require('discord.js')
const { Command } = require('../command.js')
const { funnyFaces, achievements } = require('../constants.js')

module.exports = [
    new Command({
        name: "stats",
        description: "Gets your stats or another user's stats if you mention them",
        category: "Economy",
        async run(message, args, client) {
            let user = message.mentions.users.first() || message.author

            let userData = client.economy.getUser(user.id)

            const embeds = [
                new MessageEmbed()
                    .setColor(message.member.displayHexColor)
                    .setTitle(user.username + "'s statistics")
                    .setDescription("```lua\nDogeCoins: " + userData.money +
                        "\nRank: " + userData.rank + "```")
                    .addFields({
                        name: "Achievements: ",
                        value: userData.achievements.getFormattedBinary(achievements.binary, "❔ ???\n")
                    }),
                new MessageEmbed()
                    .setColor(message.member.displayHexColor)
                    .setTitle(user.username + "'s statistics")
                    .setDescription("Acquired v_s: \n" + userData.vgot.getFormattedBinary(funnyFaces.binary, "❔"))
                ]

                /*+
                "\nXilefunds: " + userData.xilefunds + "```")*/
                // .addFields(
                //     {
                //         name: "Singleplayer stats:",
                //         value:
                //             "```js\nImpostors found: " + EconomySystem.impostors +
                //             "\nDriller tier: " + EconomySystem.driller +
                //             "\nDungeon top floor: " + EconomySystem.floor +
                //             "\nMineSweeper matches won: " + EconomySystem.msweeper + "```",
                //         inline: true
                //     },
                //     {
                //         name: "Multiplayer stats:",
                //         value:
                //             "```lua\nReversi matches won: " + EconomySystem.reversi +
                //             "\nConnect four matches won: " + EconomySystem.connect4 +
                //             "\nRoshambo matches won: " + EconomySystem.roshambo + "```",
                //         inline: true
                //     },
                //     {
                //         name: "Achievements:",
                //         value: EconomySystem.achievments.getBinary(Achievements.binary, "❔ ???\n")
                //     }
                // )

            message.channel.send({ embeds: embeds })
        }
    })
]