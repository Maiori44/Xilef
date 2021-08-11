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

exports.Game = Game
exports.MPGame = MPGame

require("./Minigames/crew.js")
require("./Minigames/driller.js")
require("./Minigames/dungeon.js")
require("./Minigames/reversi.js")
require("./Minigames/connect 4.js")
require("./Minigames/v_ roll.js")