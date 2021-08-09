const { RequiredArg, Command } = require("./../commands.js")
const { Game, MPGame } = require("./../minigames.js")

class Connect4Game {
    constructor() {
        this.board = []
        for (var y = 0; y < 6; y++) {
            this.board[y] = []
            for (var x = 0; x < 7; x++) {
                this.board[y][x] = Connect4.emptyTile
            }
        }
        this.finished = false
    }

    getMatchInfo() {
        let board = ":zero::one::two::three::four::five::six:\n"
        for (var y = 0; y < 6; y++) {
            for (var x = 0; x < 7; x++) {
                board = board + this.board[y][x]
            }
            board = board + "\n"
        }
        return new Discord.MessageEmbed()
            .setColor("#0078d7")
            .setTitle("Connect4 match")
            .setDescription(board)
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
        while (this.board[cy] && this.board[cy][cx]) {
            if (this.board[cy][cx] == checktile) {
                tilesfound = tilesfound + 1
            } else {
                break
            }
            cx = cx + dirx
            cy = cy + diry
        }
        return tilesfound
    }
}

Connect4 = new MPGame((message) => {
    Connect4.hosts[message.author.id] = new Connect4Game()
    return Connect4.hosts[message.author.id]
})
Connect4.emptyTile = "<:blue_square:870714439836516454>"
Connect4.yellowTile = "<:yellow_circle:870716292515106846>"
Connect4.redTile = "<:red_circle:870716292640964618>"
Connect4.help =
    "`&connect4 host` will make you host a match, the person who hosts a match is always yellow\n" +
    "`&connect4 join (@user)` will make you join the pinged user's match if they are hosting\n" +
    "`&connect4 quit` will make you leave the current match, if you are the host the joiner will be kicked too\n" +
    "`&connect4 place (x)` places a disc in the given x\n" +
    "`&connect4 board` shows the board of the current match, the users playing and who's turn it is"

Commands.connect4 = new Command("Make a line of 4 discs in any directions to win (warning: you need a friend)\n\n" + Connect4.help, (message, args) => {
    args[0] = args[0].toLowerCase()
    switch (args[0]) {
        case "host": {
            Connect4.makeGame(message)
            break
        }
        case "join": {
            Connect4.connectGame(message)
            break
        }
        case "quit": {
            message.channel.send(Connect4.leaveGame(message.author.id))
            break
        }
        case "place": {
            let [Connect4Game, playernum] = Connect4.getGame(message.author.id)
            if (Connect4Game.finished) {
                throw ("This match arleady ended.")
            }
            if (playernum != Connect4Game.turn) {
                throw ("It's not your turn yet.")
            }
            let x = parseInt(args[1])
            if (isNaN(x)) {
                throw ("You need to give a valid x for where to place your disc\nExample: `&connect4 place 0` will place your disc in the leftmost column")
            }
            if (x >= 0 && x <= 6) {
                let tile = Connect4Game.turn == 1 ? Connect4.yellowTile : Connect4.redTile
                for (var y = 5; y > -1; y--) {
                    if (Connect4Game.board[y][x] == Connect4.emptyTile) {
                        Connect4Game.board[y][x] = tile
                        Connect4Game.turn = (Connect4Game.turn % 2) + 1
                        message.channel.send(Connect4Game.getMatchInfo())
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
                            Connect4.closeGame(message.author.id)
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
            let [Connect4Game, playernum] = Connect4.getGame(message.author.id)
            message.channel.send(Connect4Game.getMatchInfo())
            break
        }
        default: {
            message.channel.send(Connect4.help)
            return
        }
    }
}, "Game", [new RequiredArg(0, Connect4.help, "command"), new RequiredArg(1, undefined, "argument", true)], "https://en.wikipedia.org/wiki/Connect_Four")