const { RequiredArg, Command } = require("./../commands.js")
const { Game, MPGame } = require("./../minigames.js")

class Entity {
    constructor(hp, mana, attack, defense, ai) {
        this.hp = hp
        this.mana = mana
        this.attack = attack
        this.defense = defense
        this.ai = ai
        this.castmsg = this.ai ? "The " + this.ai + " uses " : "You use "
    }

    fight(Entity, damage) {
        let dmg = Math.max(damage - Entity.defense, 1)
        Entity.hp = Entity.hp - dmg
        return (this.ai ? "The " + this.ai + " attacks you!" : "You attack " + Entity.ai + "!") + " (" + dmg + " damage dealt)"
    }

    think(DungeonGame) {
        let omana = this.mana
        let msg = this.ai + " does nothing.."
        if (Dungeon.thinkers[this.ai]) msg = Dungeon.thinkers[this.ai](DungeonGame, this)
        if (omana = this.mana) {
            this.mana = Math.min(this.mana + 10 * DungeonGame.floor, 2000)
        }
        return msg
    }
}

class Attack {
    constructor(name, cost, effect) {
        this.name = name
        this.cost = cost
        this.effect = effect
    }

    use() {

    }
}

class DungeonGame {
    constructor() {
        this.floor = 1
        this.cash = 0
        this.player = new Entity(200, 200, 40, 20)
        this.explored = 3
        this.enemies = []
    }

    reset() {
        this.floor = 1
        this.cash = 0
        this.player = new Entity(200, 200, 40, 20)
        this.explored = 3
        this.enemies = []
    }

    getInfo(EconomySystem) {
        let InfoEmbed = new Discord.MessageEmbed()
            .setColor("#006400")
            .setTitle(EconomySystem.user + "'s Dungeon stats")
            .setTimestamp();
        let desc = "```js\nfloor: " + this.floor + " (best: " + EconomySystem.floor + ")" +
            "\ncash found: " + this.cash +
            "\nhealth: " + this.player.hp + "/2000" +
            "\nmana: " + this.player.mana + "/2000" +
            "\nattack: " + this.player.attack +
            "\ndefense: " + this.player.defense
        if (this.enemies.length) {
            desc = desc + "\n\nENEMIES:"
            for (let Enemy of this.enemies) {
                desc = desc + "\n" + Enemy.ai + ": " + Enemy.hp + " hp left"
            }
        }
        desc = desc + "```"
        InfoEmbed.setDescription(desc)
        return InfoEmbed
    }
}

Dungeon = new Game(() => { return new DungeonGame() })
Dungeon.enemies = [
    [40, 0, 25, 0, "slime"],
    [55, 0, 30, 0, "zombie"],
    [90, 0, 40, 5, "goblin"],
    [80, 0, 60, 20, "skeleton"],
    [65, 0, 40, 10, "skeleton archer"],
    [75, 100, 50, 5, "skeleton mage"],
    [200, 0, 40, 0, "slime"], //big slime
    [125, 125, 125, 0, "ghost"],
    [400, 0, 90, 75, "goblin"], //armored goblin
    [350, 0, 80, 60, "skeleton"], //skeleton brute
    [150, 0, 110, 160, "mimic"],
    [300, 150, 75, 69, "v_"],
    [400, 0, 100, 100, "golem"], //mini golem
    [300, 175, 125, 40, "ghost"], //spectre
    [500, 0, 25, 0, "slime"], //abyss slime
    [600, 0, 200, 110, "golem"],
    [900, 200, 250, 150, "v_"], //distortedv_
    [1000, 175, 125, 40, "ghost"], //great ghost
    [2000, 400, 250, 300, "golem"], //power golem 
]
Dungeon.thinkers = {
    slime: (DungeonGame, Entity) => {
        if (DungeonGame.player.hp / 2) {
            return Dungeon.attacks.default(Entity, DungeonGame.player)
        }
        return "The slime hops around.."
    }
}
Dungeon.attacks = {
    default: (Attacker, Attacked) => {
        return Attacker.fight(Attacked, Attacker.attack)
    },
    fire: (Attacker, Attacked) => {
        let msg = Attacker.castmsg + "Fire Blast!"
        msg = msg + "\n" + Attacker.fight(Attacked, Attacker.attack * 0.6)
    },
}
Dungeon.help =
    "`&dungeon stats` say the stats of your current adventure\n" +
    "`&dungeon explore` explore the current floor in the dungeon and find treasures..or enemies!\n" +
    "`&dungeon ascend` go to the next floor\n" +
    "`&dungeon attack (type)` attack the current enemy, omit type for a list of all attacks\n" +
    "`&dungeon regen (amount)` regenerate some mana, it won't be free\n" +
    "`&dungeon cashin` get all the DogeCoins the dungeon got, and reset the game"

Commands.dungeon = new Command("Find treasures and fight enemies\n\n" + Dungeon.help, (message, args) => {
    if (message.author.id != "621307633718132746") {
        throw ("This command is still incomplete")
    }
    let EconomySystem = Economy.getEconomySystem(message.author)
    let DungeonGame = Dungeon.getGame(message.author.id, EconomySystem)
    args[0] = args[0].toLowerCase()
    switch (args[0]) {
        case "stats": {
            message.channel.send(DungeonGame.getInfo(EconomySystem))
            break
        }
        case "explore": {
            let ohp = DungeonGame.player.hp
            if (!DungeonGame.explored) {
                let InfoEmbed = DungeonGame.getInfo(EconomySystem)
                InfoEmbed.addField("Latest event:", "There is nothing left in this floor...")
                message.channel.send(InfoEmbed)
                return
            }
            let msg = ""
            let random = GetPercentual()
            let enemyid
            if (random <= 25) {
                let cash = DungeonGame.floor * 50
                msg = "You find a treasure worth " + cash + " DogeCoins!"
                DungeonGame.cash = DungeonGame.cash + cash
            } else if (random <= 50) {
                msg = "You find an upgrade to your sword! Your attack increased!"
                DungeonGame.player.attack = DungeonGame.player.attack + 5 * DungeonGame.floor
            } else if (random <= 75) {
                msg = "You find an upgrade to your shield! Your defense increased!"
                DungeonGame.player.defense = DungeonGame.player.defense + 5 * DungeonGame.floor
            } else {
                enemyid = Math.floor(Math.random() * (DungeonGame.floor + 1))
                msg = "You find a " + Dungeon.enemies[enemyid][4] + "!"
            }
            DungeonGame.explored = DungeonGame.explored - 1
            if (!DungeonGame.explored) {
                msg = msg + "\nIt seems that there is nothing left in this floor.."
            }
            for (let Enemy of DungeonGame.enemies) {
                msg = msg + "\n" + Enemy.think(DungeonGame)
            }
            if (enemyid !== undefined) {
                DungeonGame.enemies.push(new Entity(...Dungeon.enemies[enemyid]))
            }
            if (ohp == DungeonGame.player.hp) {
                DungeonGame.player.hp = DungeonGame.player.hp + Math.min(5 * DungeonGame.floor, 50)
            }
            let InfoEmbed = DungeonGame.getInfo(EconomySystem)
            InfoEmbed.addField("Latest event:", msg)
            message.channel.send(InfoEmbed)
            break
        }
        case "ascend": {
            if (DungeonGame.enemies.length) {
                throw ("You can't ascend while monsters are attacking you!")
            }
            DungeonGame.floor = DungeonGame.floor + 1
            DungeonGame.explored = 2 + DungeonGame.floor
            message.channel.send("You have reached floor " + DungeonGame.floor)
            break
        }
        case "repair": {
            let cost = parseInt(args[1])
            if (isNaN(cost)) {
                throw ("I need to know how much you want to repair,\nexample: `&driller repair 50` will restore 50 hp of the drill, and will cost 50 DogeCoins")
            }
            if (DungeonGame.hp == 100 * EconomySystem.driller) {
                message.channel.send("Your driller is arleady in perfect condition.")
            } else if (EconomySystem.buy(cost, message, "Your driller recovered " + cost + " hp! (" + cost + " DogeCoins spent)", "You need " + (cost - EconomySystem.money) + " more DogeCoins for this.")) {
                DungeonGame.hp = Math.min(DungeonGame.hp + cost, 100 * EconomySystem.driller)
            }
            break
        }
        case "upgrade": {
            if (EconomySystem.driller == 29) {
                message.channel.send("Your driller arleady reached max tier.")
                EconomySystem.award["driller", message]
            } else if (EconomySystem.buy(Driller.tiers[EconomySystem.driller - 1], message, "Your driller reached tier " + (EconomySystem.driller + 1) + "! (" + Driller.tiers[EconomySystem.driller - 1] + " DogeCoins spent)", "You don't have enough DogeCoins to upgrade your driller (" + Driller.tiers[EconomySystem.driller - 1] + " DogeCoins needed)")) {
                EconomySystem.driller = EconomySystem.driller + 1
                if (EconomySystem.driller == 29) {
                    EconomySystem.award["driller", message]
                }
            }
            break
        }
        case "cashin": {
            if (DungeonGame.enemies.length) {
                throw ("You can't cashin while monsters are attacking you!")
            }
            message.channel.send("Your driller comes back, and gives you all the DogeCoins it had collected.")
            EconomySystem.give(DungeonGame.cash, message)
            DungeonGame.reset(EconomySystem)
            break
        }
        default: {
            message.channel.send(Dungeon.help)
            return
        }
    }
    if (DungeonGame.hp < 1) {
        message.channel.send("Your driller broke! It lost whatever it had collected.")
        EconomySystem.steal(25 * DungeonGame.depth, message)
        DungeonGame.reset(EconomySystem)
    }
}, undefined/*"Game"*/, [new RequiredArg(0, Dungeon.help, "command"), new RequiredArg(1, undefined, "argument", true)])
