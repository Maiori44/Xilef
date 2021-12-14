const { RequiredArg, Command, Commands } = require("../../commands.js")
const { Game, MPGame } = require("../../minigames.js")

class RoshamboGame {
    constructor() {
        this.hostchoice = undefined
        this.hostwins = 0
        this.joinerchoice = undefined
        this.joinerwins = 0
    }

    getMatchInfo() {
        return new Discord.MessageEmbed()
            .setColor("#FFB6C1")
            .setTitle("Roshambo match")
            .setDescription((!this.hostchoice && !this.joinerchoice) ? "Both players have to decide their move!" : !(this.hostchoice && this.joinerchoice) ? "Someone still needs to make their choice!" : "Both players are ready!")
            .addFields(
                { name: "Host (" + this.hostwins + " wins)", value: this.hostname + "\n" + ((this.hostchoice && this.joinerchoice) ? Roshambo.moves[this.hostchoice]?.hand : this.hostchoice ? "✅" : "❌"), inline: true },
                { name: "Vs.", value: "** **", inline: true},
                { name: "Joiner (" + this.joinerwins + " wins)", value: this.joinername + "\n" + ((this.hostchoice && this.joinerchoice) ? Roshambo.moves[this.joinerchoice]?.hand : this.joinerchoice ? "✅" : "❌"), inline: true },
            )
            .setTimestamp()
    }

    sendOptions(message) {
        const actionRow = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton({
                    style: 'DANGER',
                    label: 'Rock',
                    customId: 'roshambo-' + this.host + '-rock'
                }),
                new Discord.MessageButton({
                    style: 'SUCCESS',
                    label: 'Paper',
                    customId: 'roshambo-' + this.host + '-paper'
                }),
                new Discord.MessageButton({
                    style: 'PRIMARY',
                    label: 'Scissors',
                    customId: 'roshambo-' + this.host + '-scissors'
                }),
            );

        message.channel.send("Loading moves...")
            .then((message) => message.edit({
                content: null,
                embeds: [this.getMatchInfo()],
                components: [actionRow],
            }))
            .then((message) => {
                const collector = message.createMessageComponentCollector({
                    componentType: 'BUTTON',
                    filter: (interaction) => {
                        return [this.host, this.joiner].includes(interaction.user.id);
                    }
                });

                collector.on('collect', async (interaction) => {
                    const game = Roshambo.getGame(interaction.user.id)[0];
                    const chooser = this.host === interaction.user.id
                        ? "host"
                        : "joiner";

                    if (chooser === "joiner" && interaction.user.id !== game.joiner) {
                        return void await interaction.reply({
                            content: "You are not in this match",
                            ephemeral: true
                        });
                    }

                    await interaction.reply({
                        content: "The " + chooser + " has chosen his move!"
                    });

                    game[chooser + "choice"] = interaction.customId
                        .split('-')
                        .slice(2)
                        .join('-');

                    if (game.joinerchoice && game.hostchoice) {
                        await interaction.channel.send({ embeds: [game.getMatchInfo()] });

                        if (game.hostchoice === Roshambo.moves[game.joinerchoice].beats) {
                            game.awardWin("joiner", interaction.message);
                        } else if (game.joinerchoice === Roshambo.moves[game.hostchoice].beats) {
                            game.awardWin("host", interaction.message);
                        } else await interaction.channel.send("It's a tie!");

                        game.hostchoice = undefined;
                        game.joinerchoice = undefined;
                    }

                    game.sendOptions(interaction.message);
                });
            });
    }

    awardWin(winner, message) {
        message.channel.send("The " + winner + " wins!")
        this[winner + "wins"]++
        const EconomySystem = Economy.getEconomySystem({ id: this[winner], username: this[winner + "name"] })
        EconomySystem.give(25, message)
        EconomySystem.alterValue("roshambo", 1)
        if (EconomySystem.roshambo >= 25) {
            EconomySystem.award("roshambo", message)
        }
    }
}

Roshambo = new MPGame((message) => {
    Roshambo.hosts[message.author.id] = new RoshamboGame()
    return Roshambo.hosts[message.author.id]
})
Roshambo.moves = {
    rock: { beats: "scissors", hand: "👊" },
    paper: { beats: "rock", hand: "🤚" },
    scissors: { beats: "paper", hand: "✌️" },
}
Roshambo.help =
    "`&roshambo host` will make you host a match\n" +
    "`&roshambo join (@user)` will make you join the pinged user's match if they are hosting\n" +
    "`&roshambo quit` will make you leave the current match, if you are the host the joiner will be kicked too\n" +
    "`&roshambo moves` shows the 3 moves of Roshambo, the match will start when both player choose one"

Commands.roshambo = new Command("Beat your friend in a classic rock, paper, scissors match!\n\n" + Roshambo.help, (message, args) => {
    args[0] = args[0].toLowerCase()
    switch (args[0]) {
        case "host": {
            Roshambo.makeGame(message)
            break
        }
        case "join": {
            Roshambo.connectGame(message)
            const RoshamboGame = Roshambo.getGame(message.author.id)[0]
            RoshamboGame.message = message
            RoshamboGame.sendOptions(message)
            break
        }
        case "quit": {
            const RoshamboGame = Roshambo.getGame(message.author.id)[0]
            RoshamboGame.hostchoice = undefined
            RoshamboGame.joinerchoice = undefined
            message.channel.send(Roshambo.leaveGame(message.author.id))
            break
        }
        case "moves": {
            const RoshamboGame = Roshambo.getGame(message.author.id)[0]
            RoshamboGame.message = message
            RoshamboGame.sendOptions(message)
            break
        }
        default: {
            message.channel.send(Roshambo.help.replace(/\&/g, Prefix.get(message.guild.id)))
            return
        }
    }
}, "Game", [new RequiredArg(0, Roshambo.help, "command"), new RequiredArg(1, undefined, "@user", true)], "https://en.wikipedia.org/wiki/Rock_paper_scissors")
