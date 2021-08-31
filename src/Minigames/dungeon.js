const { RequiredArg, Command } = require("./../commands.js")
const { Game, MPGame } = require("./../minigames.js")

class Entity {
    constructor(hp, mana, attack, defense, ai, name, isboss) {
        this.hp = hp
        this.mana = mana
        this.attack = attack
        this.defense = defense
        this.ai = ai
        this.name = name
        this.isboss = isboss
        this.castmsg = this.ai ? "The " + this.name + " uses " : "You use "
        this.evmsg = this.ai ? "The " + this.name + "'s " : "Your "
    }

    fight(Entity, damage) {
        let dmg = Math.floor(Math.max(damage - Entity.defense, 1))
        Entity.hp = Entity.hp - dmg
        return (this.ai ? "The " + this.name + " attacks you!" : "You attack " + Entity.name + "!") + " (" + dmg + " damage dealt)"
    }

    think(DungeonGame) {
        const omana = this.mana
        let msg = "The " + this.ai + " does nothing.."
        if (Dungeon.thinkers[this.ai]) msg = Dungeon.thinkers[this.ai](DungeonGame, this)
        if (this.ai == "player" && omana == this.mana) {
            this.mana = Math.min(this.mana + 10 * DungeonGame.floor, 2000)
        }
        this.hp = Math.floor(this.hp)
        this.mana = Math.floor(this.mana)
        this.attack = Math.floor(this.attack)
        this.defense = Math.floor(this.defense)
        return msg
    }
}

class Attack {
    constructor(name, cost, effect) {
        this.name = name
        this.cost = cost
        this.effect = effect
    }

    use(Attacker, Attacked) {
        if (Attacker.mana < this.cost) throw ("You need " + this.cost + " mana for this spell")
        Attacker.mana = Attacker.mana - this.cost
        return Attacker.castmsg + this.name + "!\n" + this.effect(Attacker, Attacked)
    }
}

class DungeonGame {
    constructor() {
        this.floor = 1
        this.cash = 0
        this.player = new Entity(100, 100, 40, 20)
        this.explored = 3
        this.enemies = []
    }

    get statmax() {
        return 300 + 10 * (this.floor - 1)
    }

    reset() {
        this.floor = 1
        this.cash = 0
        this.player = new Entity(100, 100, 40, 20)
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
            "\nattack: " + this.player.attack + "/" + this.statmax +
            "\ndefense: " + this.player.defense + "/" + this.statmax
        if (this.enemies.length) {
            desc = desc + "\n\nENEMIES:"
            for (let Enemy of this.enemies) {
                if (!Enemy) continue
                desc = desc + "\n" + Enemy.name + ": " + Enemy.hp + " hp left" + (Enemy.isboss ? " (BOSS!)" : "")
            }
        }
        desc = desc + "```"
        InfoEmbed.setDescription(desc)
        let map = []
        for (let i = 0; i < 2 + this.floor; i++) {
            map.push(i > this.explored ? "<:green_square:869976853090271323>" : i == this.explored ? "<:white_circle:869976843263045642>" : "<:brown_square:875834929034973224>")
        }
        InfoEmbed.addField("Current floor:", map.reverse().join(""))
        return InfoEmbed
    }
}

Dungeon = new Game(() => { return new DungeonGame() })
Dungeon.enemies = [
    // surface
    [50, 0, 20, 0, "slime", "green slime"],
    [60, 0, 40, 15, "skeleton", "skeleton"],
    [100, 100, 45, 20, "rock-elemental", "rock elemental"],
    [55, 0, 35, 10, "goblin", "goblin novice"],
    [45, 0, 25, 5, "bat", "cave bat"],
    [150, 100, 60, 30, "lost-spirit", "lost spirit", true],
    // overgrown
    [80, 0, 40, 5, "slime", "moss slime"],
    [110, 0, 60, 25, "skeleton", "overgrown skeleton"],
    [200, 200, 65, 40, "vine-monster", "vine monster"],
    [100, 0, 70, 20, "goblin", "goblin brute"],
    [120, 0, 50, 10, "bat", "jungle bat"],
    [300, 200, 90, 60, "nature-elemental", "nature elemental", true],
    // crystal
    [160, 0, 45, 20, "slime", "crystaline slime"],
    [240, 0, 85, 35, "skeleton", "prism skeleton"],
    [400, 300, 90, 60, "gemstone-golem", "gemstone golem"],
    [250, 0, 80, 30, "goblin", "goblin crusher"],
    [210, 0, 65, 15, "bat", "glowing bat"],
    [600, 300, 120, 90, "crystal-elemental", "crystal elemental", true],
    // spirit
    [270, 0, 60, 40, "slime", "howling slime"],
    [320, 0, 90, 40, "skeleton", "skeleton summoner"],
    [600, 400, 100, 80, "great spirit", "great spirit"],
    [310, 0, 85, 40, "goblin", "goblin spiritualist"],
    [300, 0, 75, 20, "bat", "albino bat"],
    [900, 400, 150, 120, "power-ghost", "power ghost", true],
    // dark
    [360, 0, 90, 50, "slime", "void slime"],
    [430, 0, 90, 50, "skeleton", "voidhammer skeleton"],
    [800, 500, 135, 100, "void-ghost", "void ghost"],
    [415, 0, 90, 50, "goblin", "ambush goblin"],
    [400, 0, 90, 25, "bat", "great bat"],
    [1200, 500, 180, 150, "the-void", "the void", true],
    // magma
    [460, 0, 105, 60, "slime", "magma slime"],
    [500, 0, 105, 60, "skeleton", "skeleton incinerator"],
    [1000, 600, 160, 120, "bone-snake", "bone-snake"],
    [500, 0, 105, 60, "goblin", "goblin firewarrior"],
    [500, 0, 105, 30, "bat", "lava bat"],
    [1500, 600, 210, 180, "lava-elemental", "lava elemental", true],
    // blight
    [600, 0, 120, 70, "slime", "blighted slime"],
    [600, 0, 120, 70, "skeleton", "infected skeleton"],
    [1200, 700, 180, 140, "blight-orb", "blight orb"],
    [600, 0, 120, 70, "goblin", "mutated goblin"],
    [600, 0, 120, 70, "bat", "corrupted bat"],
    [1800, 700, 240, 210, "radiant-core", "radiant core", true],
    // error
    [700, 0, 135, 80, "slime", "mistake slime"],
    [700, 0, 135, 80, "skeleton", "skerrorton"],
    [1400, 800, 180, 160, "question-mark", "???"],
    [700, 0, 135, 80, "goblin", "gobboblin"],
    [700, 0, 135, 80, "bat", "bullet bat"],
    [2100, 800, 270, 240, "error", "%}])@&!(*%-!", true],
    // ancient
    [800, 0, 150, 90, "slime", "primordial slime"],
    [800, 0, 150, 90, "skeleton", "ancient skeleton"],
    [1600, 900, 225, 180, "ancient-swordmaster", "ancient swordmaster"],
    [800, 0, 150, 90, "goblin", "goblin cyclops"],
    [800, 0, 150, 90, "bat", "irontooth bat"],
    [2400, 900, 300, 210, "Giygas clone", "Giygas clone", true],
    // element
    [900, 0, 165, 100, "slime", "core slime"],
    [900, 0, 165, 100, "skeleton", "plasmabone skeleton"],
    [1800, 1000, 220, 200, "amoled-elemental", "amoled elemental"],
    [900, 0, 165, 100, "goblin", "goblin elemental"],
    [900, 0, 165, 100, "bat", "ultrabat"],
    [2700, 1000, 320, 300, "true-elemental", "true elemental", true],
    // hell
    [1000, 0, 180, 110, "slime", "inferno slime"],
    [1000, 0, 180, 110, "skeleton", "everburn skeleton"],
    [2000, 1000, 270, 220, "ruined-elemental", "ruined elemental"],
    [1000, 0, 180, 110, "goblin", "ashhammer goblin"],
    [1000, 0, 180, 110, "bat", "hellstone bat"],
    [3000, 1000, 360, 330, "Calamitas clone", "Calamitas clone", true],
]
Dungeon.thinkers = {
    slime: (DungeonGame, Entity) => {
        if (GetPercentual() <= 20) {
            return Entity.fight(DungeonGame.player, Entity.attack)
        }
        return `The ${Entity.name} hops around..`
    },
    skeleton: (DungeonGame, Entity) => {
        if (DungeonGame.player.attack > Entity.defense * 1.7) {
            Entity.defense = Math.floor(Entity.defense * 1.7)
            return `The ${Entity.name} drinks..milk..\nThe skeleton defense increases!`
        }
        return Dungeon.attacks.slash.use(Entity, DungeonGame.player)
    },
    "rock-elemental": (DungeonGame, Entity) => {
        const chance = GetPercentual()
        if (Entity.mana < 25 || chance == 100) {
            Entity.mana = 100
            return "The rock elemental absorbs rocks around it\nThe rock elemental mana increases!"
        } else if (chance < 60) {
            Entity.mana -= 25
            return "The rock elemental throws rock at you!\n" +
                Entity.fight(DungeonGame.player, Entity.attack) + "\n" +
                Entity.fight(DungeonGame.player, Entity.attack) + "\n" +
                Entity.fight(DungeonGame.player, Entity.attack)
        }
        return Dungeon.attacks.slash.use(Entity, DungeonGame.player)
    },
    goblin: (DungeonGame, Entity) => {
        if (GetPercentual() <= 20) {
            return `The ${Entity.name} charges!\n` +
                Entity.fight(DungeonGame.player, Math.floor(Entity.attack / 2)) + "\n" +
                Entity.fight(DungeonGame.player, Math.floor(Entity.attack / 2)) + "\n" +
                Entity.fight(DungeonGame.player, Math.floor(Entity.attack / 2))
        }
        DungeonGame.cash = Math.max(DungeonGame.cash - 20, 0)
        return Dungeon.attacks.slash.use(Entity, DungeonGame.player) + `\nThe ${Entity.name} steals some of your money!`
    },
    bat: (DungeonGame, Bat) => {
        if (Bat.mana >= 150) {
            return Dungeon.attacks.leech.use(Bat, DungeonGame.player)
        } else if (GetPercentual() <= 35) {
            DungeonGame.enemies.push(new Entity(Bat.hp * 0.8, Bat.mana + 50, Bat.attack * 1.8, Bat.defense, "bat", Bat.name))
            return `The ${Bat.name} calls for help!\nAnother bat joined the fight!`
        }
        return Bat.fight(DungeonGame.player, Bat.attack)
    },
    "lost-spirit": (DungeonGame, Entity) => {
        if (Entity.mana >= 25 && DungeonGame.player.defense >= 40) {
            Entity.mana -= 25
            DungeonGame.player.defense = DungeonGame.player.defense * 0.8
            return "The lost spirit haunts you..\nYour defense decreased!"
        }
        Entity.mana += 10
        return Entity.fight(DungeonGame.player, Entity.attack)
    },
    "vine-monster": (DungeonGame, Entity) => {
        if (GetPercentual() >= 50 && Entity.mana >= 25) {
            Entity.mana -= 25
            DungeonGame.player.attack = DungeonGame.player.attack * 0.7
            return Dungeon.attacks.slash.use(Entity, DungeonGame.player) + "\nYour attack decreased!"
        }
    }
}
/*Dungeon.thinkers = {
    zombie: (DungeonGame, Entity) => {
        let msg = "The zombie becomes more vicious!\nThe zombie attack increased!\n"
        Entity.attack = Entity.attack * 1.1
        msg = msg + Entity.fight(DungeonGame.player, Entity.attack)
        return msg
    },
    "skeleton archer": (DungeonGame, Entity) => {
        if (GetPercentual() <= 40) {
            return Entity.fight(DungeonGame.player, Entity.attack + DungeonGame.player.defense) + "\nIt's a perfect hit!"
        }
        return Entity.fight(DungeonGame.player, Entity.attack)
    },
    "skeleton mage": (DungeonGame, Entity) => {
        const chance = GetPercentual()
        if (chance <= 40 && Entity.mana >= 50) {
            return Dungeon.attacks.ice.use(Entity, DungeonGame.player)
        } else if (Entity.mana >= 25) {
            return Dungeon.attacks.fire.use(Entity, DungeonGame.player)
        } else {
            Entity.mana = Entity.mana + 75
            return "The skeleton mage recharges his wand..and recovers mana!"
        }
    },
    ghost: (DungeonGame, Entity) => {
        const chance = GetPercentual()
        if (chance <= 20) {
            DungeonGame.player.defense = Math.floor(DungeonGame.player.defense * 0.7)
            return "The ghost is stinky! You're disgusted!\nYour defense decreases!"
        } else if (chance <= 40 && Entity.mana >= 25) {
            return Dungeon.attacks.fire.use(Entity, DungeonGame.player)
        }
        return Entity.fight(DungeonGame.player, Entity.attack)
    },
    mimic: (DungeonGame, Entity) => {
        if (GetPercentual() <= 40) {
            return "The mimic transforms into DogeCoins!\n..you're smart enough to realize the trap."
        }
        return "The mimic transforms into DogeCoins!\nYou found some DogeCoin--\n" + Entity.fight(DungeonGame.player, Entity.attack)
    },
    "meme fanatic": (DungeonGame, Entity) => {
        if (DungeonGame.player.mana > Entity.mana + 50 && Entity.mana >= 50) {
            return Dungeon.attacks.ice.use(Entity, DungeonGame.player)
        } else if (Entity.mana >= 100) {
            return Dungeon.attacks.thunder.use(Entity, DungeonGame.player)
        } else {
            Entity.mana = Entity.mana + 75
            return "The meme fanatic recharges his meme power..and recovers mana!"
        }
    },
    golem: (DungeonGame, Entity) => {
        if (Entity.mana >= 100) {
            Entity.mana = Entity.mana - 100
            return "The golem uses Rock Throw!\n" + Entity.fight(DungeonGame.player, Entity.attack * 3)
        }
        return Dungeon.attacks.slash.use(Entity, DungeonGame.player)
    },
    "Giygas clone": (DungeonGame, Entity) => {
        if (GetPercentual() <= 50 && Entity.mana >= 175) {
            return "You cannot grasp the true form of Giygas attack!\n" +
                Dungeon.attacks.fire.use(Entity, DungeonGame.player) + "\n" +
                Dungeon.attacks.ice.use(Entity, DungeonGame.player) + "\n" +
                Dungeon.attacks.thunder.use(Entity, DungeonGame.player)
        }
        Entity.mana = Entity.mana + 75
        return "You cannot grasp the true form of Giygas attack!\n" + Entity.fight(DungeonGame.player, Entity.attack * 2)
    },
    "Supreme Calamitas clone": (DungeonGame, Entity) => {
        if (Entity.mana >= 200) {
            return Dungeon.attacks.fire.use(Entity, DungeonGame.player) + "\n" +
                Dungeon.attacks.fire.use(Entity, DungeonGame.player) + "\n" +
                Dungeon.attacks.fire.use(Entity, DungeonGame.player) + "\n" +
                Dungeon.attacks.fire.use(Entity, DungeonGame.player)
        }
        Entity.mana = 20000
        return "Supreme Calamitas recharges..and restores all of its mana!"
    },
}*/
Dungeon.attacks = {
    slash: new Attack("Slash", 0, (Attacker, Attacked) => {
        return Attacker.fight(Attacked, Attacker.attack)
    }),
    fire: new Attack("Fire Storm", 25, (Attacker, Attacked) => {
        const msg = Attacker.fight(Attacked, Math.floor(Attacker.attack * 0.6)) +
            "\n" + Attacked.evmsg + "defence decreased!"
        Attacked.defense = Math.floor(Attacked.defense * 0.7)
        return msg
    }),
    ice: new Attack("Ice Blast", 50, (Attacker, Attacked) => {
        const msg = Attacker.fight(Attacked, Math.floor(Attacker.attack * 1.4)) +
            "\n" + Attacked.evmsg + "mana decreased!"
        Attacked.mana = Math.floor(Attacked.mana * 0.6)
        return msg
    }),
    shockwave: new Attack("Shockwave", 50, (Attacker, Attacked) => {
        const msg = Attacker.fight(Attacked, Math.floor(Attacker.attack * 0.5)) +
            "\n" + Attacked.evmsg + "attack decreased!"
        Attacked.attack = Math.floor(Attacked.attack * 0.7)
        return msg
    }),
    ground: new Attack("Earthquake", 75, (Attacker, Attacked) => {
        let DungeonGame
        for (let ID in Dungeon.list) {
            if (Dungeon.list[ID].player == Attacker) {
                DungeonGame = Dungeon.list[ID]
                break
            }
        }
        if (!DungeonGame) throw ("Could not find your game.")
        let msg = ""
        for (let Enemy of DungeonGame.enemies) {
            msg = msg + (msg == "" ? "" : "\n") + Attacker.fight(Enemy, Attacker.attack)
        }
        return msg
    }),
    thunder: new Attack("Thunder", 100, (Attacker, Attacked) => {
        const chance = GetPercentual()
        if (chance <= 30) return "..the attack misses!"
        const msg = Attacker.fight(Attacked, Math.floor(Attacker.attack * 2)) +
            "\n" + Attacked.evmsg + "attack decreased!\n" + Attacked.evmsg + "defense decreased!"
        Attacked.attack = Math.floor(Attacked.attack * 0.7)
        Attacked.defense = Math.floor(Attacked.defense * 0.7)
        return msg
    }),
    leech: new Attack("Leech", 150, (Attacker, Attacked) => {
        const chance = GetPercentual()
        if (chance <= 40) return "..the attack misses!"
        const msg = Attacker.fight(Attacked, Math.floor(Attacker.attack * 0.7)) +
            "\n" + Attacked.evmsg + "got life stealed!"
        Attacker.hp += Math.floor(Attacker.attack * 0.7)
        return msg
    }),
}
Dungeon.help =
    "`&dungeon stats` say the stats of your current adventure\n" +
    "`&dungeon explore` explore the current floor in the dungeon and find treasures..or enemies!\n" +
    "`&dungeon ascend` go to the next floor\n" +
    "`&dungeon attack (type)` attack the current enemy, omit type for a list of all attacks\n" +
    "`&dungeon escape` attempt to escape from all current enemies, might fail\n" +
    "`&dungeon cashin` get all the DogeCoins you found, and reset the game"

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
            let ohp = DungeonGame.player.hp
            if (!DungeonGame.explored) {
                let InfoEmbed = DungeonGame.getInfo(EconomySystem)
                InfoEmbed.addField("Latest event:", "There is nothing left in this floor...")
                message.channel.send(InfoEmbed)
                return
            }
            let msg = ""
            const random = GetPercentual()
            let doenemy = false
            if (random <= 20) {
                let cash = DungeonGame.floor * 25
                msg = "You find a treasure worth " + cash + " DogeCoins!"
                DungeonGame.cash = DungeonGame.cash + cash
            } else if (random <= 30) {
                msg = "You find an upgrade to your sword! Your attack increased!"
                DungeonGame.player.attack = Math.min(DungeonGame.player.attack + 5 * DungeonGame.floor, DungeonGame.statmax)
            } else if (random <= 40) {
                msg = "You find an upgrade to your shield! Your defense increased!"
                DungeonGame.player.defense = Math.min(DungeonGame.player.defense + 5 * DungeonGame.floor, DungeonGame.statmax)
            } else {
                doenemy = true
            }
            DungeonGame.explored = DungeonGame.explored - 1
            for (let Enemy of DungeonGame.enemies) {
                msg = msg + "\n" + Enemy.think(DungeonGame)
            }
            if (doenemy) {
                msg = msg + "\n"
                const loop = Math.min(Math.max(DungeonGame.floor - 19, 1), 5)
                for (let i = 1; i <= loop; i++) {
                    let enemyid = Math.min(Math.floor(Math.random() * (DungeonGame.floor + 1)), Dungeon.enemies.length - 1)
                    msg = msg + "You find a " + Dungeon.enemies[enemyid][4] + "!" + (i == loop ? "" : "\n")
                    DungeonGame.enemies.push(new Entity(...Dungeon.enemies[enemyid]))
                }
            }
            if (!DungeonGame.explored) {
                msg = msg + "\nIt seems that there is nothing left in this floor.."
            }
            if (ohp == DungeonGame.player.hp) {
                DungeonGame.player.hp = Math.min(DungeonGame.player.hp + Math.min(DungeonGame.floor, 50), 2000)
            }
            let InfoEmbed = DungeonGame.getInfo(EconomySystem)
            InfoEmbed.addField("Latest event:", msg)
            message.channel.send(InfoEmbed)
            break
        }
        case "ascend": {
            if (DungeonGame.enemies.length) {
                message.channel.send("You can't ascend while monsters are attacking you!")
                return
            }
            if (DungeonGame.explored) {
                message.channel.send("You still haven't reached the end of this floor!")
                return
            }
            DungeonGame.floor = DungeonGame.floor + 1
            DungeonGame.explored = 2 + DungeonGame.floor
            let InfoEmbed = DungeonGame.getInfo(EconomySystem)
            InfoEmbed.addField("Latest event:", "You have reached floor " + DungeonGame.floor)
            message.channel.send(InfoEmbed)
            break
        }
        case "attack": {
            if (!args[1] || !Dungeon.attacks[args[1]]) {
                message.channel.send((
                    "`&dungeon attack slash` the basic attack, costs 0\n" +
                    "`&dungeon attack fire` does slightly less damage but reduces enemy defense, costs 25\n" +
                    "`&dungeon attack ice` does slightly more damage and reduces enemy mana, costs 50\n" +
                    "`&dungeon attack shockwave` does half damage and reduces enemy attack, costs 50\n" +
                    "`&dungeon attack ground` same damage as slash but hits all enemies, costs 75\n" +
                    "`&dungeon attack thunder` does double damage and reduces both enemy attack and defense, but has a 30% chance of missing, costs 100\n"+
                    "`&dungeon attack leech` a brutal attack that does 70% damage and has a 40% chance of missing, but regains health based on damage dealt\n")
                    .replace(/\&/g, Prefix.get(message.guild.id))
                )
                return
            }
            if (!DungeonGame.enemies.length) {
                message.channel.send("There are no enemies to attack..")
                return
            }
            let msg = Dungeon.attacks[args[1]].use(DungeonGame.player, DungeonGame.enemies.slice(-1)[0])
            for (let index = 0; index <= DungeonGame.enemies.length - 1; index++) {
                let Enemy = DungeonGame.enemies[index]
                if (Enemy.hp < 1) {
                    msg = msg + "\nThe " + Enemy.ai + " was defeated!"
                    DungeonGame.enemies.splice(index, 1)
                    const cash = DungeonGame.floor * 100
                    msg = msg + "\nYou got " + cash + " DogeCoins!"
                    DungeonGame.cash = DungeonGame.cash + cash
                    msg = msg + "\nYou feel stronger..your stats increase!"
                    const boost = Math.ceil(Math.min(DungeonGame.floor / 2, 50))
                    DungeonGame.player.mana = Math.min(Math.floor(DungeonGame.player.mana + boost * 2), 2000)
                    DungeonGame.player.attack = Math.min(Math.floor(DungeonGame.player.attack + boost), DungeonGame.statmax)
                    DungeonGame.player.defense = Math.min(Math.floor(DungeonGame.player.defense + boost), DungeonGame.statmax)
                    index = -1
                } else msg = msg + "\n" + Enemy.think(DungeonGame)
            }
            const InfoEmbed = DungeonGame.getInfo(EconomySystem)
            InfoEmbed.addField("Latest event:", msg)
            message.channel.send(InfoEmbed)
            break
        }
        case "escape": {
            const chance = GetPercentual()
            if (chance > DungeonGame.floor * 2) {
                DungeonGame.enemies = []
                const InfoEmbed = DungeonGame.getInfo(EconomySystem)
                InfoEmbed.addField("Latest event:", "You managed to escape!")
                message.channel.send(InfoEmbed)
                return
            }
            let msg = "You tried to escape..but failed!"
            for (let Enemy of DungeonGame.enemies) {
                msg = msg + "\n" + Enemy.think(DungeonGame)
            }
            const InfoEmbed = DungeonGame.getInfo(EconomySystem)
            InfoEmbed.addField("Latest event:", msg)
            message.channel.send(InfoEmbed)
            break
        }
        case "cashin": {
            if (DungeonGame.enemies.length) {
                message.channel.send("You can't cashin while monsters are attacking you!")
                return
            }
            message.channel.send("Your escape the dungeon, and enjoy the DogeCoins you gained")
            EconomySystem.give(DungeonGame.cash, message)
            if (DungeonGame.floor > EconomySystem.floor) {
                EconomySystem.floor = DungeonGame.floor
                if (EconomySystem.floor >= 50) EconomySystem.award("dungeon", message)
            }
            DungeonGame.reset()
            break
        }
        default: {
            message.channel.send(Dungeon.help.replace(/\&/g, Prefix.get(message.guild.id)))
            return
        }
    }
    if (DungeonGame.player.hp < 1) {
        message.channel.send("Your died! You lost all your DogeCoins collected..")
        if (DungeonGame.floor > EconomySystem.floor) {
            EconomySystem.floor = DungeonGame.floor
            if (EconomySystem.floor >= 50) EconomySystem.award("dungeon", message)
        }
        DungeonGame.reset()
    }
}, "Game", [new RequiredArg(0, Dungeon.help, "command"), new RequiredArg(1, undefined, "argument", true)])
