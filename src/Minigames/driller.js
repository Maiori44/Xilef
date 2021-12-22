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
                "\nhealth: " + this.hp + "/" + 100 * EconomySystem.driller + "```")
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
    new DrillerOre("Copper", 10, 2, 1),
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
    new DrillerOre("Amber", 170, 21, 2),
    new DrillerOre("Thorium", 190, 22, 3),
    new DrillerOre("Nickel", 220, 23, 3),
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
    new DrillerOre("Raw Spectrite", 2800, 70, 12),
    new DrillerOre("Normal Spectrite", 4000, 71, 12),
    new DrillerOre("Pure Spectrite", 8000, 71, 12),
    new DrillerOre("More pure Spectrite", 12000, 72, 12),
    new DrillerOre("Even more pure Spectrite", 20000, 72, 12),
    new DrillerOre("Absolute Spectrite", 30000, 73, 12),
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
    new DrillerOre("The salt", 110000, 85, 15),
    new DrillerOre("Our matter", 130000, 86, 16),
    new DrillerOre("Hermes bird", 160000, 87, 17),
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
    new DrillerOre("Chicken Nuggets", 2000000, 99, 29),
    new DrillerOre("The end...", 3000000, 100, 30),
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
    69420420,
    80696969
]
Driller.help =
    "`&driller stats` says the stats of your driller\n" +
    "`&driller dig [depth]` makes the driller dig deeper, finding treasures..or lava!\n" +
    "`&driller repair (amount/\"max\")` repairs the driller, it won't be free though\n" +
    "`&driller upgrade` upgrades your driller forever, very expensive\n" +
    "`&driller cashin` get all the DogeCoins the driller got, and reset the game"

Commands.driller = new Command("Dig deeper and deeper to find the treasures\n\n" + Driller.help, (message, args) => {
    let EconomySystem = Economy.getEconomySystem(message.author)
    let DrillerGame = Driller.getGame(message.author.id, EconomySystem)
    args[0] = args[0].toLowerCase()
    switch (args[0]) {
        case "stats": {
            message.channel.send({ embeds: [DrillerGame.getInfo(EconomySystem)] })
            break
        }
        case "dig": {
            let depth = Number.parseInt(args[1]);

            if (Number.isNaN(depth)) depth = 1;

            if (depth < 1) {
                message.channel.send("What are you doing? You can only go forward, sorry my friend.");
                return;
            }


            const log = [];

            for (let i = 0; i < depth; i++) {
                if (DrillerGame.hp <= 0) {
                    log.push("You died!");
                    break;
                }

                let hurtChance = GetPercentual();

                if (DrillerGame.hitlava) hurtChance *= 2;

                const currentOre = Driller.Ores[DrillerGame.depth];

                if (currentOre.tier > EconomySystem.driller) {
                    log.push("Your driller can't dig any further, please upgrade it to dig further. For now, cashin to get the money you found.");
                    break;
                }

                if (hurtChance <= currentOre.lavachance) {
                    const lostHP = Math.max(DrillerGame.depth * 7, 1);

                    DrillerGame.hp -= lostHP;
                    DrillerGame.hitlava = true;

                    log.push(`Hit lava (lost ${lostHP} HP => ${DrillerGame.hp})`);
                } else {
                    let text = `Found ${currentOre.name}`;

                    if (currentOre.value != 0) text += `, has a value of ${currentOre.value}`;

                    log.push(text);

                    DrillerGame.cash += currentOre.value;
                    DrillerGame.depth++;

                    DrillerGame.hitlava = false;

                    if (currentOre.tier > EconomySystem.driller) {
                        log.push("Your driller cannot dig any further, please upgrade it when possible. Automatically cashing in.");

                        EconomySystem.give(DrillerGame.cash, message);
                        DrillerGame.reset(EconomySystem);
                        message.channel.send("Your driller comes back, and gives you all the DogeCoins it had collected.");
                        break;
                    }
                }
            }

            const embed = DrillerGame.getInfo(EconomySystem);

            let logPageStart = 0;
            let logPageLength = 0;
            for (let i = 0; i < log.length; i++) {
                if (logPageLength + log[i].length >= 1024) {
                    embed.addField(
                        `**Page ${embed.fields.length + 1}**`,
                        log.slice(logPageStart, i).join('\n'),
                        true
                    );

                    logPageStart = i;
                    logPageLength = 0;
                } else logPageLength += log[i].length + 1
            }

            embed.addField(
                `**Page ${embed.fields.length + 1}**`,
                log.slice(logPageStart, log.length).join('\n'),
                true
            );

            // let results = [];
            // for (var i = 0; i < log.toString().length; i += 1024)
            //     results.push(log.toString().substring(i, i + 1024));

            // if (results.length > 1)
            //     embed.addField("Warning : ", "The ore log has been split up to allow it to be sent.")

            // for (let i = 0; i < results.length; i++)
            //     embed.addField("**Page " + (i + 1) + "** :", results[i], true);

            message.channel.send({ embeds: [embed] })

            break;
        }
        case "repair": {
            const cost =
                args[1] == 'max'
                    ? 100 * EconomySystem.driller - DrillerGame.hp
                    : parseInt(args[1]);
            if (isNaN(cost)) {
                message.channel.send(`I need to know how much you want to repair,\nexample: \`${Prefix.get(message.guild.id)}driller repair 50\` will restore 50 hp of the drill, and will cost 50 DogeCoins.\nYou could also put 'max' and it will restore your drill to max hp.`)
                return
            }
            if (DrillerGame.hp == 100 * EconomySystem.driller) {
                message.channel.send("Your driller is arleady in perfect condition.")
            } else if (EconomySystem.buy(cost, message, "Your driller recovered " + cost + " hp! (" + cost + " DogeCoins spent)", "You need " + (cost - EconomySystem.money) + " more DogeCoins for this.")) {
                DrillerGame.hp = Math.min(DrillerGame.hp + cost, 100 * EconomySystem.driller)
            }
            break
        }
        case "upgrade": {
            if (EconomySystem.driller == 30) {
                message.channel.send("Your driller arleady reached max tier.")
                EconomySystem.award("driller", message)
            } else if (EconomySystem.buy(Driller.tiers[EconomySystem.driller - 1], message, "Your driller reached tier " + (EconomySystem.driller + 1) + "!", "You don't have enough DogeCoins to upgrade your driller (" + Driller.tiers[EconomySystem.driller - 1] + " DogeCoins needed)")) {
                EconomySystem.driller = EconomySystem.driller + 1
                if (EconomySystem.driller == 30) {
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
            message.channel.send(Driller.help.replace(/\&/g, Prefix.get(message.guild.id)))
            return
        }
    }
    if (DrillerGame.hp < 1) {
        message.channel.send("Your driller broke! It lost whatever it had collected.")
        EconomySystem.steal(25 * DrillerGame.depth, message)
        DrillerGame.reset(EconomySystem)
    }
}, "Game", [new RequiredArg(0, Driller.help, "command"), new RequiredArg(1, undefined, "argument", true)])
