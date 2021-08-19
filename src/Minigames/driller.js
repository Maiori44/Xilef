const { RequiredArg, Command } = require("./../commands.js")
const { Game, MPGame } = require("./../minigames.js")

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
            .setTitle(EconomySystem.user + "'s Driller stats")
            .setDescription("```lua\ndepth: " + this.depth +
                "\ntier: " + EconomySystem.driller +
                "\ncash found: " + this.cash +
                "\nhealth: " + this.hp + "/" + 100 * EconomySystem.driller +"```")
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
    new DrillerOre("Our blessed stone", 550000, 94, 23),
    new DrillerOre("Magnum opus", 700000, 95, 24),
    new DrillerOre("Philosopher's stone", 900000, 96, 25),
    new DrillerOre("Sampo", 1100000, 97, 27),
    new DrillerOre("True knowledge", 1500000, 98, 28),
    new DrillerOre("The end...", 2000000, 99, 29),
    new DrillerOre("how", -999999999, 0, 69),
]
Driller.tiers = [
    1000,
    5000,
    16000,
    40000,
    75000,
    125000,
    200000,
    250000,
    300000,
    370000,
    600000,
    1400000,
    5000000,
    5500000,
    6500000,
    8000000,
    10000000,
    12500000,
    15500000,
    19000000,
    23000000,
    27500000,
    32500000,
    38000000,
    44000000,
    50500000,
    57500000,
    69420420
]
Driller.help =
    "`&driller stats` says the stats of your driller\n" +
    "`&driller dig` makes the driller dig deeper, finding treasures..or lava!\n" +
    "`&driller repair (amount)` repairs the driller, it won't be free though\n" +
    "`&driller upgrade` upgrades your driller forever, very expensive\n" +
    "`&driller cashin` get all the DogeCoins the driller got, and reset the game"

Commands.driller = new Command("Dig deeper and deeper to find the treasures\n\n" + Driller.help.replace('&', Prefix), (message, args) => {
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
                message.channel.send(InfoEmbed)
                return
            }
            let msg = ""
            let hurtchance = GetPercentual()
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
            const cost =
                args[1] == 'max'
                    ? 100 * EconomySystem.driller - DrillerGame.hp
                    : parseInt(args[1]);
            if (isNaN(cost)) {
                throw (`I need to know how much you want to repair,\nexample: \`${Prefix.get(message.guild.id)}driller repair 50\` will restore 50 hp of the drill, and will cost 50 DogeCoins.\nYou could also put 'max' and it will restore your drill to max hp.`)
            }
            if (DrillerGame.hp == 100 * EconomySystem.driller) {
                message.channel.send("Your driller is arleady in perfect condition.")
            } else if (EconomySystem.buy(cost, message, "Your driller recovered " + cost + " hp! (" + cost + " DogeCoins spent)", "You need " + (cost - EconomySystem.money) + " more DogeCoins for this.")) {
                DrillerGame.hp = Math.min(DrillerGame.hp + cost, 100 * EconomySystem.driller)
            }
            break
        }
        case "upgrade": {
            if (EconomySystem.driller == 29) {
                message.channel.send("Your driller arleady reached max tier.")
                EconomySystem.award("driller", message)
            } else if (EconomySystem.buy(Driller.tiers[EconomySystem.driller - 1], message, "Your driller reached tier " + (EconomySystem.driller + 1) + "! (" + Driller.tiers[EconomySystem.driller - 1] + " DogeCoins spent)", "You don't have enough DogeCoins to upgrade your driller (" + Driller.tiers[EconomySystem.driller - 1] + " DogeCoins needed)")) {
                EconomySystem.driller = EconomySystem.driller + 1
                if (EconomySystem.driller == 29) {
                    EconomySystem.award("driller", message)
                }
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
            message.channel.send(Driller.help.replace('&', Prefix.get(message.guild.id)))
            return
        }
    }
    if (DrillerGame.hp < 1) {
        message.channel.send("Your driller broke! It lost whatever it had collected.")
        EconomySystem.steal(25 * DrillerGame.depth, message)
        DrillerGame.reset(EconomySystem)
    }
}, "Game", [new RequiredArg(0, Driller.help, "command"), new RequiredArg(1, undefined, "argument", true)])
