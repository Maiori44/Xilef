const { RequiredArg, Command } = require("./commands.js")

class Game {
    constructor(gamemaker) {
        this.list = {}
        this.makeGame = gamemaker
    }

    getGame(id, EconomySystem) {
        if (!this.list[id]) {
            this.list[id] = this.makeGame(EconomySystem)
        }
        return this.list[id]
    }
}

class MPGame {
    constructor(gamemaker) {
        this.hosts = {}
        this.joiners = {}
        this.gamemaker = gamemaker
    }

    makeGame(message) {
        if (this.joiners[message.author.id]) {
            throw ("You arleady are in someone else's match.")
        }
        let Game = this.gamemaker(message)
        Game.host = message.author.id
        Game.joiner = undefined
        Game.hostname = message.author.username
        Game.joinername = "`none`"
        Game.turn = 1
        message.channel.send("Successfully created a match.")
    }

    getGame(id) {
        if (this.hosts[id]) {
            return [this.hosts[id], 1]
        } else if (this.joiners[id]) {
            return [this.joiners[id], 2]
        } else {
            throw ("Could not find the match.")
        }
    }

    connectGame(message) {
        if (this.hosts[message.author.id]) {
            throw ("You are arleady hosting a match yourself.")
        }
        let host = message.mentions.users.first()
        if (!host) {
            throw ("You need to ping the person you want to join.")
        }
        if (!this.hosts[host.id]) {
            throw ("Could not find the match.")
        } else if (this.hosts[host.id].joinername != "`none`") {
            throw ("Someone is arleady inside this match.")
        }
        this.joiners[message.author.id] = this.hosts[host.id]
        this.joiners[message.author.id].joiner = message.author.id
        this.joiners[message.author.id].joinername = message.author.username
        message.channel.send("Successfully joined " + host.username + "'s match.")
    }

    leaveGame(id) {
        let quitmsg = "Successfully left the match."
        if (this.hosts[id]) {
            quitmsg = "Successfully closed the match."
        }
        if (this.hosts[id]) {
            for (let key in this.joiners) {
                if (this.joiners[key] == this.hosts[id]) {
                    this.joiners[key] = undefined
                }
            }
            this.hosts[id] = undefined
            return quitmsg
        } else if (this.joiners[id]) {
            this.joiners[id].joiner = undefined
            this.joiners[id].joinername = "`none`"
            this.joiners[id] = undefined
            return quitmsg
        } else {
            throw ("You are not inside any match.")
        }
    }

    closeGame(id) {
        if (this.hosts[id]) {
            this.leaveGame(id)
            return
        }
        for (let key in this.hosts) {
            if (this.hosts[key] == this.joiners[id]) {
                this.leaveGame(key)
                return
            }
        }
    }
}

//Among us

class AmogusGame {
    constructor() {
        this.turns = 0
        this.crew = {}
    }

    reset() {
        this.turns = 7
        this.crew.red = Math.ceil(Math.random() * 10)
        this.crew.blue = Math.ceil(Math.random() * 10)
        this.crew.green = Math.ceil(Math.random() * 10)
        this.crew.pink = Math.ceil(Math.random() * 10)
        this.crew.orange = Math.ceil(Math.random() * 10)
        this.crew.yellow = Math.ceil(Math.random() * 10)
        this.crew.black = Math.ceil(Math.random() * 10)
        this.crew.white = Math.ceil(Math.random() * 10)
        this.crew.purple = Math.ceil(Math.random() * 10)
        this.crew.cyan = Math.ceil(Math.random() * 10)
    }

    getSussier() {
        let sussier = 0
        let crewname = ""
        for (let crew in this.crew) {
            if (this.crew[crew] > sussier) {
                sussier = this.crew[crew]
                crewname = crew
            }
        }
        return crewname
    }
}

Amongus = new Game(() => {
    let Amogus = new AmogusGame()
    Amogus.reset()
    return Amogus
})
Amongus.help =
    "`&crew examine (color)` to examine a crewmate, the impostor might find you though...\n" +
    "`&crew eject (color)` to eject a crewmate out, you can only eject once"

Commands.crew = new Command("Find the imposter!", (message, args) => {
    let Amogus = Amongus.getGame(message.author.id)
    let aturn = Amogus.turns
    args[1] = args[1].toLowerCase()
    switch (args[0]) {
        case "examine": {
            if (!Amogus.crew[args[1]]) { message.channel.send(args[1] + " does not exist, lol"); return }
            let killchance = (Math.random() * 10) - Amogus.turns
            switch (Amogus.crew[args[1]]) {
                case 1: {
                    message.channel.send(args[1] + " is doing his tasks.")
                    break
                }
                case 2: {
                    message.channel.send(args[1] + " is wandering around.")
                    break
                }
                case 3: {
                    message.channel.send(args[1] + " looks at the map, probably lost.")
                    break
                }
                case 4: {
                    message.channel.send(args[1] + " is moving strangely.")
                    break
                }
                case 5: {
                    message.channel.send(args[1] + " goes in medbay.")
                    killchance = killchance + 0.5
                    break
                }
                case 6: {
                    message.channel.send(args[1] + " looks at you.")
                    killchance = killchance + 0.7
                    break
                }
                case 7: {
                    message.channel.send(args[1] + " seems to do his tasks..?")
                    killchance = killchance + 1
                    break
                }
                case 8: {
                    message.channel.send(args[1] + " runs away.")
                    killchance = killchance + 2
                    break
                }
                case 9: {
                    message.channel.send(args[1] + " is nowhere to be found.")
                    killchance = killchance + 3
                    break
                }
                case 10: {
                    message.channel.send(args[1] + " just vented!")
                    killchance = killchance + 4
                    break
                }
            }
            if (killchance > 7) {
                Amogus.turns = 0
                message.channel.send("While you were examining " + args[1] + ", the impostor finds you!")
            }
            break
        }
        case "eject": {
            let impostor = Amogus.getSussier()
            if (!Amogus.crew[args[1]]) { message.channel.send(args[1] + " does not exist, lol"); return }
            else if (args[1] == impostor || Amogus.crew[args[1]] == 10) {
                message.channel.send(args[1] + " was the impostor! congrats!")
                let EconomySystem = Economy.getEconomySystem(message.author)
                EconomySystem.give(120 - (10 * aturn), message)
                EconomySystem.alterValue("impostors", 1)
                Amogus.reset()
                return
            } else {
                message.channel.send(args[1] + " is not the impostor...")
                Amogus.turns = 0
            }
            break
        }
        default: {
            message.channel.send(Amongus.help)
            return
        }
    }
    Amogus.turns = Math.max(Amogus.turns - 1, 0)
    if (Amogus.turns == 0) {
        message.channel.send("The impostor killed you!\nThe impostor was " + Amogus.getSussier() + ".\nGame over.")
        let EconomySystem = Economy.getEconomySystem(message.author)
        EconomySystem.steal(30 + (10 * aturn), message)
        Amogus.reset()
    } else {
        message.channel.send(Amogus.turns + " turns left.")
    }
}, [new RequiredArg(0, Amongus.help),
new RequiredArg(1, "You need to choose the color of the crewmate if you want to do anything to them, " +
    "possible options are: Red, Blue, Green, Pink, Orange, Yellow, Black, White, Purple, Cyan.")])

//Driller

class DrillerGame {
    constructor(EconomySystem) {
        this.depth = 0
        this.cash = 0
        this.hp = 100 * EconomySystem.driller
        this.hitlava = false
    }

    reset(EconomySystem) {
        this.depth = 0
        this.cash = 0
        this.hp = 100 * EconomySystem.driller
    }

    getInfo(EconomySystem) {
        return new Discord.MessageEmbed()
            .setColor("#964B00")
            .setTitle("Driller stats")
            .setDescription("```lua\ndepth: " + this.depth +
                "\ntier: " + EconomySystem.driller +
                "\ncash found: " + this.cash +
                "\nhealth: " + this.hp + "```")
            .setTimestamp();
    }
}

class DrillerOre {
    constructor(name, value, lavachance, tier) {
        this.name = name
        this.value = value
        this.lavachance = lavachance
        this.tier = tier
    }
}

Driller = new Game((EconomySystem) => { return new DrillerGame(EconomySystem) })
Driller.Ores = [
    new DrillerOre("Coal", 5, 1, 1),
    new DrillerOre("Copper", 2, 11, 1),
    new DrillerOre("Tin", 15, 3, 1),
    new DrillerOre("Iron", 20, 4, 1),
    new DrillerOre("Lead", 25, 5, 1),
    new DrillerOre("Alluminium", 30, 6, 1),
    new DrillerOre("Silver", 35, 7, 1),
    new DrillerOre("Tungsten", 40, 8, 1),
    new DrillerOre("Gold", 45, 9, 1),
    new DrillerOre("Platinum", 50, 10, 1),
    new DrillerOre("Aquaite", 60, 11, 1),
    new DrillerOre("Pyratite", 80, 12, 2),
    new DrillerOre("Amethyst", 100, 13, 2),
    new DrillerOre("Topaz", 110, 14, 2),
    new DrillerOre("Sapphire", 120, 15, 2),
    new DrillerOre("Life quartz", 125, 16, 2),
    new DrillerOre("Emerald", 130, 17, 2),
    new DrillerOre("Ruby", 140, 18, 2),
    new DrillerOre("Victide", 145, 19, 2),
    new DrillerOre("Diamond", 150, 20, 2),
    new DrillerOre("Amber", 160, 21, 2),
    new DrillerOre("Thorium", 180, 22, 3),
    new DrillerOre("Nickel", 200, 23, 3),
    new DrillerOre("Ebonite", 250, 24, 3),
    new DrillerOre("Crimtane", 260, 25, 3),
    new DrillerOre("Hellstone", 300, 26, 3),
    new DrillerOre("Aerialite", 350, 27, 3),
    new DrillerOre("Mangium", 450, 28, 3),
    new DrillerOre("Uranite", 500, 29, 3),
    new DrillerOre("Ancient debris", 550, 30, 3),
    new DrillerOre("Magnetite", 650, 31, 4),
    new DrillerOre("Cobalt", 700, 32, 4),
    new DrillerOre("Palladium", 725, 33, 4),
    new DrillerOre("Mythrill", 800, 34, 4),
    new DrillerOre("Orichalcum", 825, 35, 4),
    new DrillerOre("Adamantite", 900, 36, 4),
    new DrillerOre("Titanium", 925, 37, 4),
    new DrillerOre("Darksteel ore", 1000, 38, 4),
    new DrillerOre("Lodestone", 1100, 39, 5),
    new DrillerOre("Kyanite", 1200, 40, 5),
    new DrillerOre("Valadium", 1300, 41, 5),
    new DrillerOre("Illumite", 1400, 42, 5),
    new DrillerOre("Hallowite", 1500, 43, 5),
    new DrillerOre("Niobium", 1600, 44, 5),
    new DrillerOre("Chlorophyte", 1700, 45, 5),
    new DrillerOre("Wolframite", 1800, 46, 6),
    new DrillerOre("Shroomite", 1900, 47, 6),
    new DrillerOre("Spectrite", 2000, 48, 6),
    new DrillerOre("Abyssalite", 2100, 49, 6),
    new DrillerOre("Luminite", 2200, 50, 6),
    new DrillerOre("Cryonite", 2300, 51, 6),
    new DrillerOre("Charred ore", 2400, 52, 7),
    new DrillerOre("Neutronium", 2500, 53, 7),
    new DrillerOre("Perennial ore", 2600, 54, 7),
    new DrillerOre("Scarlet ore", 2700, 55, 7),
    new DrillerOre("Thermium", 2800, 56, 7),
    new DrillerOre("Astralite", 2900, 57, 8),
    new DrillerOre("Exodium", 3000, 58, 8),
    new DrillerOre("Uelibloomite", 3250, 59, 8),
    new DrillerOre("Cosmolite", 3500, 60, 8),
    new DrillerOre("Auricite", 3750, 61, 9),
    new DrillerOre("Primodium", 4000, 62, 9),
    new DrillerOre("Shadowspec ore", 4500, 63, 9),
    new DrillerOre("Hyperius ore", 5000, 64, 10),
    new DrillerOre("Universium", 6000, 65, 10),
    new DrillerOre("The center of the earth", 7000, 66, 10),
    new DrillerOre("a strange door...", 0, 0, 10),
    new DrillerOre("a new dimension!", 0, 0, 11),
    new DrillerOre("Unknown ore", 10000, 67, 11),
    new DrillerOre("Very shiny ore", 11000, 68, 11),
    new DrillerOre("Weird-looking treasure", 12000, 69, 11),
    new DrillerOre("Weird ancient artifact", 15000, 70, 11),
    new DrillerOre("a resistent-looking door", 0, 0, 11),
    new DrillerOre("the spectrite mines!", 0, 0, 12),
    new DrillerOre("Raw Spectrite", 2000, 70, 12),
    new DrillerOre("Normal Spectrite", 4000, 71, 12),
    new DrillerOre("Pure Spectrite", 8000, 71, 12),
    new DrillerOre("More pure Spectrite", 12000, 72, 12),
    new DrillerOre("Even more pure Spectrite", 20000, 72, 12),
    new DrillerOre("Absolute Statue", 30000, 73, 12),
    new DrillerOre("Specrite statue", 42000, 73, 12),
    new DrillerOre("Spectrite vault", 54000, 74, 12),
    new DrillerOre("another, more resistent-looking door", 0, 0, 12),
    new DrillerOre("the true earth mines", 0, 0, 13),
    new DrillerOre("True Copper", 50000, 74, 13),
    new DrillerOre("True Tin", 55000, 75, 13),
    new DrillerOre("True Iron", 60000, 75, 13),
    new DrillerOre("True Lead", 65000, 76, 13),
    new DrillerOre("True Silver", 70000, 76, 13),
    new DrillerOre("True Tungsten", 75000, 77, 13),
    new DrillerOre("True Gold", 80000, 77, 13),
    new DrillerOre("True Platinum", 85000, 78, 13),
    new DrillerOre("True Meteorite", 90000, 78, 13),
    new DrillerOre("True Hellstone", 95000, 79, 13),
    new DrillerOre("Earthium", 100000, 79, 13),
    new DrillerOre("yet another even more resistent-looking door", 0, 0, 13),
    new DrillerOre("the video caves", 0, 0, 14),
    new DrillerOre("Craftine", 105000, 80, 14),
    new DrillerOre("Terrastone", 110000, 80, 14),
    new DrillerOre("Blootonium", 115000, 81, 14),
    new DrillerOre("Castelite", 120000, 81, 14),
    new DrillerOre("Asepri ore", 125000, 82, 14),
    new DrillerOre("Foragium", 130000, 82, 14),
    new DrillerOre("Oxylite", 135000, 83, 14),
    new DrillerOre("Deltarine", 140000, 83, 14),
    new DrillerOre("Stargon", 145000, 84, 14),
    new DrillerOre("Frosbium", 150000, 84, 14),
    new DrillerOre("the strongest door", 0, 0, 14),
    new DrillerOre("the final corridor", 0, 0, 15),
    new DrillerOre("The salt", 100000, 85, 15),
    new DrillerOre("Our matter", 120000, 86, 16),
    new DrillerOre("Hermes bird", 150000, 87, 17),
    new DrillerOre("White eagle", 190000, 88, 18),
    new DrillerOre("The green lion", 230000, 89, 19),
    new DrillerOre("Red lion", 250000, 90, 20),
    new DrillerOre("Celestial ruby", 270000, 91, 21),
    new DrillerOre("Magnesia", 300000, 92, 22),
    new DrillerOre("The vessel of the philosophers", 400000, 93, 23),
    new DrillerOre("Our blessed stone", 550000, 94, 24),
    new DrillerOre("Magnum opus", 700000, 95, 25),
    new DrillerOre("Philosopher's stone", 900000, 96, 26),
    new DrillerOre("Sampo", 1100000, 97, 27),
    new DrillerOre("True knowledge", 1500000, 98, 28),
    new DrillerOre("The end...", 2000000, 99, 29),
    new DrillerOre("how", -999999999, 0, 69),
]
Driller.help =
    "`&driller stats` says the stats of your driller\n" +
    "`&driller dig` makes the driller dig deeper, finding treasures..or lava!\n" +
    "`&driller repair (amount)` repairs the driller, it won't be free though\n" +
    "`&driller upgrade` upgrades your driller forever, very expensive\n" +
    "`&driller cashin` get all the DogeCoins the driller got, and reset the game"

Commands.driller = new Command("Dig deeper and deeper to find the treasures", (message, args) => {
    let EconomySystem = Economy.getEconomySystem(message.author)
    let DrillerGame = Driller.getGame(message.author.id, EconomySystem)
    args[0] = args[0].toLowerCase()
    switch (args[0]) {
        case "stats": {
            message.channel.send(DrillerGame.getInfo(EconomySystem))
            break
        }
        case "dig": {
            if (Driller.Ores[DrillerGame.depth].tier > EconomySystem.driller) {
                let InfoEmbed = DrillerGame.getInfo(EconomySystem)
                InfoEmbed.addField("Latest event:", "Your driller is too weak to dig any further!")
                return
            }
            let msg = ""
            let hurtchance = Math.floor(Math.random() * 101)
            if (DrillerGame.hitlava) hurtchance = hurtchance * 2
            if (hurtchance <= Driller.Ores[DrillerGame.depth].lavachance) {
                msg = "Your driller digs deeper..and finds lava! Your driller got damaged!"
                DrillerGame.hp = DrillerGame.hp - Math.max((7 * DrillerGame.depth), 1)
                DrillerGame.hitlava = true
            } else {
                msg = "Your driller digs deeper..and finds " + Driller.Ores[DrillerGame.depth].name + "! (worth " + Driller.Ores[DrillerGame.depth].value + ")"
                DrillerGame.cash = DrillerGame.cash + Driller.Ores[DrillerGame.depth].value
                DrillerGame.depth++
                if (Driller.Ores[DrillerGame.depth].tier > EconomySystem.driller) {
                    msg = msg + "\nYour driller is struggling to dig any further, you might need to upgrade it"
                }
                DrillerGame.hitlava = false
            }
            let InfoEmbed = DrillerGame.getInfo(EconomySystem)
            InfoEmbed.addField("Latest event:", msg)
            message.channel.send(InfoEmbed)
            break
        }
        case "repair": {
            let cost = parseInt(args[1])
            if (isNaN(cost)) {
                throw ("I need to know how much you want to repair,\nexample: `&driller repair 50` will restore 50 hp of the drill, and will cost 50 DogeCoins")
            }
            if (DrillerGame.hp == 100 * EconomySystem.driller) {
                message.channel.send("Your driller is arleady in perfect condition.")
            } else if (EconomySystem.buy(cost, message, "Your driller recovered " + cost + " hp! (" + cost + " DogeCoins spent)", "You need " + (cost - EconomySystem.money) + " more DogeCoins for this.")) {
                DrillerGame.hp = Math.min(DrillerGame.hp + cost, 100 * EconomySystem.driller)
            }
            break
        }
        case "upgrade": {
            let mul = EconomySystem.driller > 10 ? 2 : 1
            if (EconomySystem.driller == 14) {
                message.channel.send("Your driller arleady reached max tier.")
            } else if (EconomySystem.buy((1500 * EconomySystem.driller) * mul, message, "Your driller reached tier " + (EconomySystem.driller + 1) + "! (" + (1500 * EconomySystem.driller) + " DogeCoins spent)", "You don't have enough DogeCoins to upgrade your driller (" + (1500 * EconomySystem.driller) + " DogeCoins needed)")) {
                EconomySystem.driller = EconomySystem.driller + 1
            }
            break
        }
        case "cashin": {
            message.channel.send("Your driller comes back, and gives you all the DogeCoins it had collected.")
            EconomySystem.give(DrillerGame.cash, message)
            DrillerGame.reset(EconomySystem)
            break
        }
        default: {
            message.channel.send(Driller.help)
            return
        }
    }
    if (DrillerGame.hp < 1) {
        message.channel.send("Your driller broke! It lost whatever it had collected.")
        EconomySystem.steal(25 * DrillerGame.depth, message)
        DrillerGame.reset(EconomySystem)
    }
}, [new RequiredArg(0, Driller.help)])

//Reversi

class ReversiGame {
    constructor() {
        this.board = []
        for (var y = 0; y < 8; y++) {
            this.board[y] = []
            for (var x = 0; x < 8; x++) {
                this.board[y][x] = Reversi.emptyTile
            }
        }
        this.board[3][3] = Reversi.lightTile
        this.board[3][4] = Reversi.darkTile
        this.board[4][3] = Reversi.darkTile
        this.board[4][4] = Reversi.lightTile
    }

    getMatchInfo() {
        let board = ""
        for (var y = 0; y < 8; y++) {
            for (var x = 0; x < 8; x++) {
                board = board + this.board[y][x]
            }
            board = board + y + "\n"
        }
        board = board + ":zero::one::two::three::four::five::six::seven:\n"
        board = board.replace("0\n", ":zero:\n")
        board = board.replace("1\n", ":one:\n")
        board = board.replace("2\n", ":two:\n")
        board = board.replace("3\n", ":three:\n")
        board = board.replace("4\n", ":four:\n")
        board = board.replace("5\n", ":five:\n")
        board = board.replace("6\n", ":six:\n")
        board = board.replace("7\n", ":seven:\n")
        let [blackdiscs, whitediscs] = this.getTotalDiscs()
        return new Discord.MessageEmbed()
            .setColor("#009900")
            .setTitle("Reversi match")
            .setDescription(board)
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
        while (this.board[cy] && this.board[cy][cx]) {
            if (this.board[cy][cx] == checktile) {
                tilestochange.push([cy, cx])
            } else if (tilestochange.length > 0 && this.board[cy][cx] == tile) {
                if (!dontfill) {
                    for (let tileinfo of tilestochange) {
                        this.board[tileinfo[0]][tileinfo[1]] = tile
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
        for (var y = 0; y < 8; y++) {
            for (var x = 0; x < 8; x++) {
                if ((this.board[y][x] == Reversi.emptyTile || this.board[y][x] == Reversi.validTile) && (this.checkLine(tile, x, y, 1, 0, true) || this.checkLine(tile, x, y, 1, 1, true) || this.checkLine(tile, x, y, 0, 1, true) || this.checkLine(tile, x, y, -1, 1, true) || this.checkLine(tile, x, y, -1, 0, true) || this.checkLine(tile, x, y, -1, -1, true) || this.checkLine(tile, x, y, 0, -1, true) || this.checkLine(tile, x, y, 1, -1, true))) {
                    valids = valids + 1
                    this.board[y][x] = Reversi.validTile
                } else if (this.board[y][x] == Reversi.validTile) {
                    this.board[y][x] = Reversi.emptyTile
                }
            }
        }
        return valids
    }

    getTotalDiscs() {
        let blackdiscs = 0
        let whitediscs = 0
        for (var y = 0; y < 8; y++) {
            for (var x = 0; x < 8; x++) {
                if (this.board[y][x] == Reversi.darkTile) {
                    blackdiscs = blackdiscs + 1
                } else if (this.board[y][x] == Reversi.lightTile) {
                    whitediscs = whitediscs + 1
                }
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

Commands.reversi = new Command("Capture as most disks as possible to win the match (warning: you need a friend)", (message, args) => {
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
                throw ("You need to give valid coordinates for where to place your disk\nExample: `&reversi place 0 0` will place your disk in the top left corner")
            }
            if (ReversiGame.board[y] && ReversiGame.board[y][x]) {
                let tile = ReversiGame.turn == 1 ? Reversi.darkTile : Reversi.lightTile
                if (ReversiGame.board[y][x] == Reversi.validTile) {
                    ReversiGame.board[y][x] = tile
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
                    message.channel.send(ReversiGame.getMatchInfo())
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
                            } else if (blackdiscs < whitediscs) {
                                message.channel.send("The joiner wins!")
                                if (ReversiGame.joiner) {
                                    let EconomySystem = Economy.getEconomySystem({ id: ReversiGame.joiner, username: ReversiGame.joinername })
                                    EconomySystem.give(200, message)
                                    EconomySystem.alterValue("reversi", 1)
                                }
                            } else {
                                message.channel.send("It's a tie!")
                            }
                            Reversi.closeGame(message.author.id)
                        } else {
                            message.channel.send("No valid moves found! Skipping turn...")
                            message.channel.send(ReversiGame.getMatchInfo())
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
            let [ReversiGame, playernum] = Reversi.getGame(message.author.id)
            message.channel.send(ReversiGame.getMatchInfo())
            break
        }
        default: {
            message.channel.send(Reversi.help)
            return
        }
    }
}, [new RequiredArg(0, Reversi.help)])

//Connect 4

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

Commands.connect4 = new Command("Make a line of 4 discs in any directions to win (warning: you need a friend)", (message, args) => {
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
}, [new RequiredArg(0, Connect4.help)])

class v_ {
    constructor(id, bit) {
        this.id = id
        this.value = 2 ** bit - 2 ** (bit - 1)
    }
}

const v_Types = {
    binary: [

    ],
    common: [
        new v_("<:abyssv_common:873259417041268746>", 0b000000000000000000000000000000000000000000000000000000000001),
        new v_("<:concernedv_common:873259417708154880>", 0b000000000000000000000000000000000000000000000000000000000010),
        new v_("<:cringev_common:873259417007718421>", 0b000000000000000000000000000000000000000000000000000000000100),
        new v_("<:cyclopsv_common:873259417418731531>", 0b000000000000000000000000000000000000000000000000000000001000),
        new v_("<:doublev_common:873259417733312613>", 0b000000000000000000000000000000000000000000000000000000010000),
        new v_("", 0b000000000000000000000000000000000000000000000000000000100000),
        new v_("", 0b000000000000000000000000000000000000000000000000000001000000),
        new v_("", 0b000000000000000000000000000000000000000000000000000010000000),
        new v_("", 0b000000000000000000000000000000000000000000000000000100000000),
        new v_("", 0b000000000000000000000000000000000000000000000000001000000000),
        new v_("", 0b000000000000000000000000000000000000000000000000010000000000),
        new v_("", 0b000000000000000000000000000000000000000000000000100000000000),
        new v_("", 0b000000000000000000000000000000000000000000000001000000000000),
        new v_("", 0b000000000000000000000000000000000000000000000010000000000000),
        new v_("", 0b000000000000000000000000000000000000000000000100000000000000),
        new v_("", 0b000000000000000000000000000000000000000000001000000000000000),
        new v_("", 0b000000000000000000000000000000000000000000010000000000000000),
        new v_("", 0b000000000000000000000000000000000000000000100000000000000000),
    ],
    rare: [
        new v_("", 0b000000000000000000000000000000000000000001000000000000000000),
        new v_("", 0b000000000000000000000000000000000000000010000000000000000000),
        new v_("", 0b000000000000000000000000000000000000000100000000000000000000),
        new v_("", 0b000000000000000000000000000000000000001000000000000000000000),
        new v_("", 0b000000000000000000000000000000000000010000000000000000000000),
        new v_("", 0b000000000000000000000000000000000000100000000000000000000000),
        new v_("", 0b000000000000000000000000000000000001000000000000000000000000),
        new v_("", 0b000000000000000000000000000000000010000000000000000000000000),
        new v_("", 0b000000000000000000000000000000000100000000000000000000000000),
        new v_("", 0b000000000000000000000000000000001000000000000000000000000000),
        new v_("", 0b000000000000000000000000000000010000000000000000000000000000),
        new v_("", 0b000000000000000000000000000000100000000000000000000000000000),
        new v_("", 0b000000000000000000000000000001000000000000000000000000000000),
        new v_("", 0b000000000000000000000000000010000000000000000000000000000000),
    ],
    epic: [
        new v_("", 0b000000000000000000000000000100000000000000000000000000000000),
        new v_("", 0b000000000000000000000000001000000000000000000000000000000000),
        new v_("", 0b000000000000000000000000010000000000000000000000000000000000),
        new v_("", 0b000000000000000000000000100000000000000000000000000000000000),
        new v_("", 0b000000000000000000000001000000000000000000000000000000000000),
        new v_("", 0b000000000000000000000010000000000000000000000000000000000000),
        new v_("", 0b000000000000000000000100000000000000000000000000000000000000),
        new v_("", 0b000000000000000000001000000000000000000000000000000000000000),
        new v_("", 0b000000000000000000010000000000000000000000000000000000000000),
        new v_("", 0b000000000000000000100000000000000000000000000000000000000000),
        new v_("", 0b000000000000000001000000000000000000000000000000000000000000),
        new v_("", 0b000000000000000010000000000000000000000000000000000000000000),
        new v_("", 0b000000000000000100000000000000000000000000000000000000000000),
    ],
    legendary: [
        new v_("", 0b000000000000001000000000000000000000000000000000000000000000),
        new v_("", 0b000000000000010000000000000000000000000000000000000000000000),
        new v_("", 0b000000000000100000000000000000000000000000000000000000000000),
        new v_("", 0b000000000001000000000000000000000000000000000000000000000000),
        new v_("", 0b000000000010000000000000000000000000000000000000000000000000),
        new v_("", 0b000000000100000000000000000000000000000000000000000000000000),
        new v_("", 0b000000001000000000000000000000000000000000000000000000000000),
        new v_("", 0b000000010000000000000000000000000000000000000000000000000000),
        new v_("", 0b000000100000000000000000000000000000000000000000000000000000),
        new v_("", 0b000001000000000000000000000000000000000000000000000000000000),
        new v_("", 0b000010000000000000000000000000000000000000000000000000000000),
        new v_("", 0b000100000000000000000000000000000000000000000000000000000000),
        new v_("", 0b001000000000000000000000000000000000000000000000000000000000),
    ]
}
