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
}

class DungeonGame {
    constructor() {
        this.floor = 1
        this.cash = 0
        this.player = new Entity(300, 300, 60, 40)
        this.explored = 3
    }

    reset() {
        this.floor = 1
        this.cash = 0
        this.player = new Entity(300, 300, 60, 40)
        this.explored = 3
        this.enemy = undefined
    }

    getInfo(EconomySystem) {
        return new Discord.MessageEmbed()
            .setColor("#006400")
            .setTitle(EconomySystem.user + "'s Dungeon stats")
            .setDescription("```lua\nfloor: " + this.floor + " (best: " + EconomySystem.floor + ")" +
                "\ncash found: " + this.cash +
                "\nhealth: " + this.player.hp +
                "\nmana: " + this.player.mana +
                "\nattack: " + this.player.attack +
                "\ndefence: " + this.player.defence +
                "```")
            .setTimestamp();
    }
}

Dungeon = new Game(() => { return new DungeonGame() })
Dungeon.help =
"`&dungeon stats` says the stats in your current adventure\n" +
"`&dungeon explore` makes you explore the current floor in the dungeon, you might find treasures..or enemies!\n" +
"`&dungeon attack (type)` attack the current enemy, omit type for a list of all attacks\n" +
"`&dungeon rest` \n" +
"`&dungeon cashin` get all the DogeCoins the dungeon got, and reset the game"