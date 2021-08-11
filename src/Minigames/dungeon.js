const { RequiredArg, Command } = require("./../commands.js")
const { Game, MPGame } = require("./../minigames.js")

class Entity {
    constructor(hp, mana, attack, defence, ai) {
        this.hp = hp
        this.mana = mana
        this.attack = attack
        this.defence = defence
        this.ai = ai
    }

    attack(entity, damage) {
        
    }

    think() {

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
        return new Discord.MessageEmbed()
            .setColor("#006400")
            .setTitle(EconomySystem.user + "'s Dungeon stats")
            .setDescription("```lua\nfloor: " + this.floor + " (best: " + EconomySystem.floor + ")" +
                "\ncash found: " + this.cash +
                "\nhealth: " + this.player.hp + "/2000" +
                "\nmana: " + this.player.mana + "/2000" +
                "\nattack: " + this.player.attack +
                "\ndefence: " + this.player.defence +
                "```")
            .setTimestamp();
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
    goblin() {
        
    }
}
Dungeon.help =
    "`&dungeon stats` says the stats in your current adventure\n" +
    "`&dungeon explore` makes you explore the current floor in the dungeon, you might find treasures..or enemies!\n" +
    "`&dungeon attack (type)` attack the current enemy, omit type for a list of all attacks\n" +
    "`&dungeon heal (amount)` regenerate some hp, it won't be free\n" +
    "`&dungeon cashin` get all the DogeCoins the dungeon got, and reset the game"

Commands.dungeon = new Command("Find treasures and fight enemies\n\n" + Dungeon.help, (message, args) => {
    let EconomySystem = Economy.getEconomySystem(message.author)
    let DungeonGame = Dungeon.getGame(message.author.id, EconomySystem)
    args[0] = args[0].toLowerCase()
    switch (args[0]) {
        case "stats": {
            message.channel.send(DungeonGame.getInfo(EconomySystem))
            break
        }
        case "explore": {
            if (!DungeonGame.explored) {
                let InfoEmbed = DrillerGame.getInfo(EconomySystem)
                InfoEmbed.addField("Latest event:", "There is nothing left in this floor...")
                message.channel.send(InfoEmbed)
                return
            }
            let msg = ""
            let enemyname
            let random = GetPercentual()
            if (random <= 25) {
                let cash = DungeonGame.floor * 50
                msg = "You find a treasure worth " + cash + " DogeCoins!"
                DungeonGame.cash = DungeonGame.cash + cash
            } else if (random <= 50) {
                msg = "You find an upgrade to your sword! Your attack increased!"
                DungeonGame.player.attack = DungeonGame.player.attack + 5 * DungeonGame.floor
            } else if (random <= 75) {
                msg = "You find an upgrade to your shield! Your attack increased!"
                DungeonGame.player.attack = DungeonGame.player.attack + 5 * DungeonGame.floor
            } else {
                //ADD ENEMY STUFF
            }
            DungeonGame.explored = DungeonGame.explored - 1
            if (!DungeonGame.explored) {
                msg = msg + "\n"
            }
            let InfoEmbed = DungeonGame.getInfo(EconomySystem)
            InfoEmbed.addField("Latest event:", msg)
            message.channel.send(InfoEmbed)
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
            message.channel.send("Your driller comes back, and gives you all the DogeCoins it had collected.")
            EconomySystem.give(DungeonGame.cash, message)
            DungeonGame.reset(EconomySystem)
            break
        }
        default: {
            message.channel.send(Driller.help)
            return
        }
    }
    if (DungeonGame.hp < 1) {
        message.channel.send("Your driller broke! It lost whatever it had collected.")
        EconomySystem.steal(25 * DungeonGame.depth, message)
        DungeonGame.reset(EconomySystem)
    }
}, "Game", [new RequiredArg(0, Dungeon.help, "command"), new RequiredArg(1, undefined, "argument", true)])
