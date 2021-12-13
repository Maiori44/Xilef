const { RequiredArg, Command, Commands } = require("./../commands.js")
const { MPGame } = require("./../minigames.js")
const { MessageEmbed } = require('discord.js')
const { Matrix } = require("./../matrix.js")

const emptyTile = "<:green_square:869976853090271323>"
const validTile = "<:orange_square:869976862615543818>"
const darkTile = "<:black_circle:869976829811884103>"
const lightTile = "<:white_circle:869976843263045642>"
const helpMessage =
    "`&reversi host` will make you host a match, the person who hosts a match is always dark\n" +
    "`&reversi join (@user)` will make you join the pinged user's match if they are hosting\n" +
    "`&reversi quit` will make you leave the current match, if you are the host the joiner will be kicked too\n" +
    "`&reversi place (x) (y)` will try to place a disk in the given location\n" +
    "`&reversi board` shows the board of the current match, the users playing and who's turn it is"

class ReversiGame {
    constructor() {
        this.board = new Matrix(8, 8, emptyTile)
            .set(3, 3, lightTile)
            .set(3, 4, darkTile)
            .set(4, 3, darkTile)
            .set(4, 4, lightTile)
    }

    getMatchInfo() {
        let [blackdiscs, whitediscs] = this.getTotalDiscs()
        return new MessageEmbed()
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
        let checktile = tile == lightTile ? darkTile : lightTile
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
            if ((checktile == emptyTile || checktile == validTile) && (this.checkLine(tile, x, y, 1, 0, true) || this.checkLine(tile, x, y, 1, 1, true) || this.checkLine(tile, x, y, 0, 1, true) || this.checkLine(tile, x, y, -1, 1, true) || this.checkLine(tile, x, y, -1, 0, true) || this.checkLine(tile, x, y, -1, -1, true) || this.checkLine(tile, x, y, 0, -1, true) || this.checkLine(tile, x, y, 1, -1, true))) {
                valids = valids + 1
                Cell.value = validTile
            } else if (checktile == validTile) {
                Cell.value = emptyTile
            }
        }
        return valids
    }

    getTotalDiscs() {
        let blackdiscs = 0
        let whitediscs = 0
        for (const Cell of this.board) {
            const tile = Cell.value
            if (tile == darkTile) {
                blackdiscs += 1
            } else if (tile == lightTile) {
                whitediscs += 1
            }
        }
        return [blackdiscs, whitediscs]
    }
}

Reversi = new MPGame((message) => {
    Reversi.hosts[message.author.id] = new ReversiGame()
    Reversi.hosts[message.author.id].findValidPositions(darkTile)
    return Reversi.hosts[message.author.id]
})


Commands.reversi = new Command("Capture as most disks as possible to win the match (warning: you need a friend)\n\n" + helpMessage, (message, args) => {
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
                let tile = ReversiGame.turn == 1 ? darkTile : lightTile

                if (ReversiGame.board.compare(x, y, validTile)) {
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

                    let validmoves = ReversiGame.findValidPositions(tile == lightTile ? darkTile : lightTile)
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
            message.channel.send(helpMessage.replace(/\&/g, Prefix.get(message.guild.id)))
            return
        }
    }
}, "Game", [new RequiredArg(0, helpMessage, "command"), new RequiredArg(1, undefined, "argument 1", true), new RequiredArg(2, undefined, "argument 2", true)], "https://en.wikipedia.org/wiki/Reversi")