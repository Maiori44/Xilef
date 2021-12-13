const { RequiredArg, Command, Commands } = require("./../commands.js")
const { Game } = require("./../minigames.js")
const { MessageEmbed } = require('discord.js')

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
        return new MessageEmbed()
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

(async () => {
    let jsonOres = require('./ores.json')
    let oreNames = Object.keys(jsonOres)
    let oreStats = Object.values(jsonOres)
    for (let i = 0; i < oreNames.length; i++) {
        ores.push(new DrillerOre(oreNames[i], oreStats[i][0], oreStats[i][1], oreStats[i][2]))
    }
})()

Driller = new Game((EconomySystem) => { return new DrillerGame(EconomySystem) })

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

            let depth = parseInt(args[1]);

            if (depth < 1) {
                message.channel.send("What are you doing? You can only go forward, sorry my friend.");
                return;
            }

            if (isNaN(depth)) {
                depth = 1;
            }

            let log = [];

            for (let x = 1; x <= depth; x++) {
                if (DrillerGame.hp <= 0) {
                    log += "You died!"
                    break
                }
                let hurtchance = GetPercentual();
                if (DrillerGame.hitlava) hurtchance = hurtchance * 2

                let currentOre = Driller.Ores[DrillerGame.depth]
                if (currentOre.tier > EconomySystem.driller) {

                    log += "Your driller can't dig any further, please upgrade it to dig further. For now, cashin to get the money you found."
                    break;
                }

                if (hurtchance <= currentOre.lavachance) {
                    const lostHp = Math.max((7 * DrillerGame.depth), 1)
                    DrillerGame.hp -= lostHp
                    DrillerGame.hitlava = true
                    log += `Hit lava (lost ${lostHp} HP => ${DrillerGame.hp}) \n`
                }
                else {
                    let text = `Found ${currentOre.name}`
                    if (currentOre.value != 0)
                        text += `, has a value of ${currentOre.value}\n`
                    log += text

                    DrillerGame.cash += currentOre.value
                    DrillerGame.depth++

                    DrillerGame.hitlava = false

                    if (currentOre.tier > EconomySystem.driller) {
                        log += "Your driller cannot dig any further, please upgrade it when possible. Automatically cashing in."

                        message.channel.send("Your driller came back, and gave you all the DogeCoins it had collected.")
                        EconomySystem.give(DrillerGame.cash, message)
                        DrillerGame.reset(EconomySystem)

                        break
                    }
                }

            }

            const resultEmbed = DrillerGame.getInfo(EconomySystem)

            let results = [];
            for (var i = 0; i < log.toString().length; i += 1024)
                results.push(log.toString().substring(i, i + 1024));

            if (results.length > 1)
                resultEmbed.addField("Warning : ", "The ore log has been split up to allow it to be sent.")

            for (let i = 0; i < results.length; i++)
                resultEmbed.addField("**Page " + (i + 1) + "** :", results[i], true);

            message.channel.send({ embeds: [resultEmbed] })

            break
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
                message.channel.send("Your driller already reached max tier.")
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
