const { RequiredArg, Command, Commands } = require("./../commands.js")
const { MPGame } = require("./../minigames.js")
const { Matrix } = require("./../matrix.js")
const { MessageEmbed } = require('discord.js')
const { Prefix, GetPercentual } = require('../constants.js')

class Connect4Game {
    constructor() {
        this.board = new Matrix(7, 6, connect4.emptyTile)
        this.finished = false
    }

    getMatchInfo() {
        return new MessageEmbed()
            .setColor("#0078d7")
            .setTitle("Connect4 match")
            .setDescription(":zero::one::two::three::four::five::six:\n" + this.board.toString(undefined, true))
            .addFields(
                { name: "Host (yellow)", value: this.hostname, inline: true },
                { name: "Joiner (red)", value: this.joinername, inline: true },
            )
            .setTimestamp()
            .setFooter(this.finished ? "This match is over" : (this.turn == 1 ? "\nIt's the host turn" : "\nIt's the joiner turn"))
    }

    getDiscs(checktile, startx, starty, dirx, diry) {
        let cx = startx + dirx
        let cy = starty + diry
        let tilesfound = 0
        while (this.board.checkBounds(cx, cy)) {
            if (this.board.compare(cx, cy, checktile)) {
                tilesfound += 1
            } else break
            cx = cx + dirx
            cy = cy + diry
        }
        return tilesfound
    }
}

const connect4 = new MPGame((message) => {
    connect4.hosts[message.author.id] = new Connect4Game()
    return connect4.hosts[message.author.id]
})

connect4.emptyTile = "<:blue_square:870714439836516454>"
connect4.yellowTile = "<:yellow_circle:870716292515106846>"
connect4.redTile = "<:red_circle:870716292640964618>"
connect4.help =
    "`&connect4 host` will make you host a match, the person who hosts a match is always yellow\n" +
    "`&connect4 join (@user)` will make you join the pinged user's match if they are hosting\n" +
    "`&connect4 quit` will make you leave the current match, if you are the host the joiner will be kicked too\n" +
    "`&connect4 place (x)` places a disc in the given x\n" +
    "`&connect4 board` shows the board of the current match, the users playing and who's turn it is"

Commands.connect4 = new Command("Make a line of 4 discs in any directions to win (warning: you need a friend)\n\n" + connect4.help, (message, args) => {
    args[0] = args[0].toLowerCase()
    switch (args[0]) {
        case "host": {
            connect4.makeGame(message)
            break
        }
        case "join": {
            connect4.connectGame(message)
            break
        }
        case "quit": {
            message.channel.send(connect4.leaveGame(message.author.id))
            break
        }
        case "place": {
            let [Connect4Game, playernum] = connect4.getGame(message.author.id)
            if (Connect4Game.finished) {
                throw ("This match already ended.")
            }
            if (playernum != Connect4Game.turn) {
                throw ("It's not your turn yet.")
            }
            let x = parseInt(args[1])
            if (isNaN(x)) {
                throw (`You need to give a valid x for where to place your disc\nExample: \`${Prefix.get(message.guild.id)}connect4 place 0\` will place your disc in the leftmost column`)
            }
            if (x >= 0 && x <= 6) {
                let tile = Connect4Game.turn == 1 ? connect4.yellowTile : connect4.redTile
                for (var y = 5; y > -1; y--) {
                    if (Connect4Game.board.compare(x, y, connect4.emptyTile)) {
                        Connect4Game.board.set(x, y, tile)
                        Connect4Game.turn = (Connect4Game.turn % 2) + 1
                        message.channel.send({ embeds: [Connect4Game.getMatchInfo()] })
                        if ((Connect4Game.getDiscs(tile, x, y, 0, 1) + Connect4Game.getDiscs(tile, x, y, 0, -1)) >= 3 ||
                            (Connect4Game.getDiscs(tile, x, y, 1, 0) + Connect4Game.getDiscs(tile, x, y, -1, 0)) >= 3 ||
                            (Connect4Game.getDiscs(tile, x, y, -1, 1) + Connect4Game.getDiscs(tile, x, y, 1, -1)) >= 3 ||
                            (Connect4Game.getDiscs(tile, x, y, -1, -1) + Connect4Game.getDiscs(tile, x, y, 1, 1)) >= 3) {
                            Connect4Game.finished = true
                            let winner = Connect4Game.turn == 1 ? "joiner" : "host"
                            message.channel.send("The " + winner + " wins!")
                            let EconomySystem = Economy.getEconomySystem({ id: Connect4Game[winner], username: Connect4Game[winner + "name"] })
                            EconomySystem.give(50, message)
                            EconomySystem.alterValue("connect4", 1)
                            if (EconomySystem.connect4 >= 15) {
                                EconomySystem.award("connect4", message)
                            }
                            connect4.closeGame(message.author.id)
                        }
                        return
                    }
                }
                throw ("There isn't space left in that column")
            } else {
                throw ("Your given x is off bounds.")
            }
        }
        case "board": {
            let [Connect4Game, playernum] = connect4.getGame(message.author.id)
            message.channel.send({ embeds: [Connect4Game.getMatchInfo()] })
            break
        }
        default: {
            message.channel.send(connect4.help.replace(/\&/g, Prefix.get(message.guild.id)))
            return
        }
    }
}, "Game",[new RequiredArg(0, connect4.help, "command"), new RequiredArg(1, undefined, "argument 1", true)], "https://en.wikipedia.org/wiki/Connect_Four")