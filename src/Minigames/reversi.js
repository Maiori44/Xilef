const { RequiredArg, Command, Commands } = require("./../commands.js")
const { MPGame } = require("./../minigames.js")
const { Matrix } = require("./../matrix.js")

class ReversiGame {
    constructor() {
        this.board = new Matrix(8, 8, Reversi.emptyTile)
            .set(3, 3, Reversi.lightTile)
            .set(3, 4, Reversi.darkTile)
            .set(4, 3, Reversi.darkTile)
            .set(4, 4, Reversi.lightTile)
    }

    getMatchInfo() {
        let [blackdiscs, whitediscs] = this.getTotalDiscs()
        return new Discord.MessageEmbed()
            .setColor("#009900")
            .setTitle("Reversi match")
            .setDescription(this.board.toString())
            .addFields(
                { name: "Host (dark)", value: this.hostname + "\n" + blackdiscs + " disks", inline: true },
                { name: "Joiner (light)", value: this.joinername + "\n" + whitediscs + " disks", inline: true },
            )
            .setTimestamp()
            .setFooter(this.turn == 1 ? "\nIt's the host turn" : "\nIt's the joiner turn")
    }

    checkLine(tile, startx, starty, dirx, diry, dontfill) {
        let checktile = tile == Reversi.lightTile ? Reversi.darkTile : Reversi.lightTile
        let cx = startx + dirx
        let cy = starty + diry
        let tilestochange = []
        while (this.board.checkBounds(cx, cy)) {
            if (this.board.compare(cx, cy, checktile)) {
                tilestochange.push([cy, cx])
            } else if (tilestochange.length > 0 && this.board.compare(cx, cy, tile)) {
                if (!dontfill) {
                    for (let tileinfo of tilestochange) {
                        this.board.set(tileinfo[1], tileinfo[0], tile)
                    }
                }
                return true
            } else {
                return false
            }
            cx = cx + dirx
            cy = cy + diry
        }
        return false
    }

    findValidPositions(tile) {
        let valids = 0
        for (const Cell of this.board) {
            const checktile = Cell.value
            const x = Cell.x
            const y = Cell.y
            if ((checktile == Reversi.emptyTile || checktile == Reversi.validTile) && (this.checkLine(tile, x, y, 1, 0, true) || this.checkLine(tile, x, y, 1, 1, true) || this.checkLine(tile, x, y, 0, 1, true) || this.checkLine(tile, x, y, -1, 1, true) || this.checkLine(tile, x, y, -1, 0, true) || this.checkLine(tile, x, y, -1, -1, true) || this.checkLine(tile, x, y, 0, -1, true) || this.checkLine(tile, x, y, 1, -1, true))) {
                valids = valids + 1
                Cell.value = Reversi.validTile
            } else if (checktile == Reversi.validTile) {
                Cell.value = Reversi.emptyTile
            }
        }
        return valids
    }

    getTotalDiscs() {
        let blackdiscs = 0
        let whitediscs = 0
        for (const Cell of this.board) {
            const tile = Cell.value
            if (tile == Reversi.darkTile) {
                blackdiscs += 1
            } else if (tile == Reversi.lightTile) {
                whitediscs += 1
            }
        }
        return [blackdiscs, whitediscs]
    }
}

Reversi = new MPGame((message) => {
    Reversi.hosts[message.author.id] = new ReversiGame()
    Reversi.hosts[message.author.id].findValidPositions(Reversi.darkTile)
    return Reversi.hosts[message.author.id]
})
Reversi.emptyTile = "<:green_square:869976853090271323>"
Reversi.validTile = "<:orange_square:869976862615543818>"
Reversi.darkTile = "<:black_circle:869976829811884103>"
Reversi.lightTile = "<:white_circle:869976843263045642>"
Reversi.help =
    "`&reversi host` will make you host a match, the person who hosts a match is always dark\n" +
    "`&reversi join (@user)` will make you join the pinged user's match if they are hosting\n" +
    "`&reversi quit` will make you leave the current match, if you are the host the joiner will be kicked too\n" +
    "`&reversi place (x) (y)` will try to place a disk in the given location\n" +
    "`&reversi board` shows the board of the current match, the users playing and who's turn it is"

Commands.reversi = new Command("Capture as most disks as possible to win the match (warning: you need a friend)\n\n" + Reversi.help, (message, args) => {
    args[0] = args[0].toLowerCase()
    switch (args[0]) {
        case "host": {
            Reversi.makeGame(message)
            break
        }
        case "join": {
            Reversi.connectGame(message)
            break
        }
        case "quit": {
            message.channel.send(Reversi.leaveGame(message.author.id))
            break
        }
        case "place": {
            let [ReversiGame, playernum] = Reversi.getGame(message.author.id)
            if (playernum != ReversiGame.turn) {
                throw ("It's not your turn yet.")
            }
            let x = parseInt(args[1])
            let y = parseInt(args[2])
            if (isNaN(x) || isNaN(y)) {
                throw (`You need to give valid coordinates for where to place your disk\nExample: \`${Prefix.get(message.guild.id)}reversi place 0 0\` will place your disk in the top left corner`)
            }
            if (ReversiGame.board.checkBounds(x, y)) {
                let tile = ReversiGame.turn == 1 ? Reversi.darkTile : Reversi.lightTile
                if (ReversiGame.board.compare(x, y, Reversi.validTile)) {
                    ReversiGame.board.set(x, y, tile)
                    ReversiGame.checkLine(tile, x, y, 1, 0)
                    ReversiGame.checkLine(tile, x, y, 1, 1)
                    ReversiGame.checkLine(tile, x, y, 0, 1)
                    ReversiGame.checkLine(tile, x, y, -1, 1)
                    ReversiGame.checkLine(tile, x, y, -1, 0)
                    ReversiGame.checkLine(tile, x, y, -1, -1)
                    ReversiGame.checkLine(tile, x, y, 0, -1)
                    ReversiGame.checkLine(tile, x, y, 1, -1)
                    ReversiGame.turn = (ReversiGame.turn % 2) + 1
                    let validmoves = ReversiGame.findValidPositions(tile == Reversi.lightTile ? Reversi.darkTile : Reversi.lightTile)
                    message.channel.send({ embeds: [ReversiGame.getMatchInfo()] })
                    if (validmoves == 0) {
                        validmoves = ReversiGame.findValidPositions(tile)
                        ReversiGame.turn = (ReversiGame.turn % 2) + 1
                        if (validmoves == 0) {
                            let [blackdiscs, whitediscs] = ReversiGame.getTotalDiscs()
                            message.channel.send("No valid moves found for either player! Game over!")
                            if (blackdiscs > whitediscs) {
                                message.channel.send("The host wins!")
                                let EconomySystem = Economy.getEconomySystem({ id: ReversiGame.host, username: ReversiGame.hostname })
                                EconomySystem.give(200, message)
                                EconomySystem.alterValue("reversi", 1)
                                if (EconomySystem.reversi >= 15) {
                                    EconomySystem.award("reversi", message)
                                }
                            } else if (blackdiscs < whitediscs) {
                                message.channel.send("The joiner wins!")
                                if (ReversiGame.joiner) {
                                    let EconomySystem = Economy.getEconomySystem({ id: ReversiGame.joiner, username: ReversiGame.joinername })
                                    EconomySystem.give(200, message)
                                    EconomySystem.alterValue("reversi", 1)
                                    if (EconomySystem.reversi >= 15) {
                                        EconomySystem.award("reversi", message)
                                    }
                                }
                            } else {
                                message.channel.send("It's a tie!")
                            }
                            Reversi.closeGame(message.author.id)
                        } else {
                            message.channel.send("No valid moves found! Skipping turn...")
                            message.channel.send({ embeds: [ReversiGame.getMatchInfo() ]})
                        }
                    }
                    break
                }
                throw ("That is not a valid position.")
            } else {
                throw ("Your given location is off bounds.")
            }
        }
        case "board": {
            let [ReversiGame] = Reversi.getGame(message.author.id)
            message.channel.send({ embeds: [ReversiGame.getMatchInfo()] })
            break
        }
        default: {
            message.channel.send(Reversi.help.replace(/\&/g, Prefix.get(message.guild.id)))
            return
        }
    }
}, "Game", [new RequiredArg(0, Reversi.help, "command"), new RequiredArg(1, undefined, "argument 1", true), new RequiredArg(2, undefined, "argument 2", true)], "https://en.wikipedia.org/wiki/Reversi")