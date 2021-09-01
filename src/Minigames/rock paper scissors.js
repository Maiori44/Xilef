const { RequiredArg, Command } = require("./../commands.js")
const { Game, MPGame } = require("./../minigames.js")
const { MessageButton, MessageActionRow } = require("discord-buttons")

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
                { name: "Host (" + this.hostwins + " wins)", value: this.hostname + "\n" + ((this.hostchoice && this.joinerchoice) ? Roshambo.moves[this.hostchoice].hand : this.hostchoice ? "✅" : "❌"), inline: true },
                { name: "Vs.", value: "** **", inline: true},
                { name: "Joiner (" + this.joinerwins + " wins)", value: this.joinername + "\n" + ((this.hostchoice && this.joinerchoice) ? Roshambo.moves[this.joinerchoice].hand : this.joinerchoice ? "✅" : "❌"), inline: true },
            )
            .setTimestamp()
    }

    sendOptions(message) {
        const options = new MessageActionRow()
        options.addComponent(new MessageButton()
            .setStyle("red")
            .setLabel("Rock")
            .setID("roshambo-" + this.host + "-rock"))
        options.addComponent(new MessageButton()
            .setStyle("green")
            .setLabel("Paper")
            .setID("roshambo-" + this.host + "-paper"))
        options.addComponent(new MessageButton()
            .setStyle("blurple")
            .setLabel("Scissors")
            .setID("roshambo-" + this.host + "-scissors"))
        message.channel.send("Loading moves...", options).then((newmessage) => newmessage.edit("", this.getMatchInfo()))
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

ButtonEvents.roshambo = async (button, id, optionname) => {
    const RoshamboGame = Roshambo.getGame(id)[0]
    const chooser = id == button.clicker.id ? "host" : "joiner"
    if (chooser == "joiner" && button.clicker.id != RoshamboGame.joiner) {
        await button.reply.send("You are not in this match", true)
        return
    }
    RoshamboGame[chooser + "choice"] = optionname
    await button.reply.send("The " + chooser + " has chosen his move!")
    if (RoshamboGame.joinerchoice && RoshamboGame.hostchoice) {
        RoshamboGame.message.channel.send(RoshamboGame.getMatchInfo())
        if (RoshamboGame.hostchoice == Roshambo.moves[RoshamboGame.joinerchoice].beats)
            RoshamboGame.awardWin("joiner", RoshamboGame.message)
        else if (RoshamboGame.joinerchoice == Roshambo.moves[RoshamboGame.hostchoice].beats)
            RoshamboGame.awardWin("host", RoshamboGame.message)
        else RoshamboGame.message.channel.send("It's a tie!")
        RoshamboGame.hostchoice = undefined
        RoshamboGame.joinerchoice = undefined
        RoshamboGame.sendOptions(RoshamboGame.message)
    }
}

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