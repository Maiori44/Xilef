const { Colors } = require('./constants.js')
const fs = require('fs')

class Game {
    constructor(gamemaker) {
        this.list = {}
        this.makeGame = gamemaker
    }

    getGame(ID, EconomySystem) {
        if (!this.list[ID]) {
            this.list[ID] = this.makeGame(EconomySystem)
            console.log("- " + Colors.cyan.colorize("Successfully created a new Game:") +
                "\n\tCreator name: " + (EconomySystem ? EconomySystem.user : Colors.hyellow.colorize("Unknown")) +
                "\n\tCreator ID: " + ID)
        }
        return this.list[ID]
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
            console.log("- " + Colors.blue.colorize("Aborted attempt at creating a new MPGame"))
            throw ("You arleady are in someone else's match.")
        }
        let Game = this.gamemaker(message)
        Game.host = message.author.id
        Game.joiner = undefined
        Game.hostname = message.author.username
        Game.joinername = "`none`"
        Game.turn = 1
        message.channel.send("Successfully created a match.")
        console.log("- " + Colors.cyan.colorize("Sucessfully created a new MPGame:") +
            "\n\tHost: " + message.author.username +
            "\n\tHost ID: " + message.author.id)
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
            console.log("- " + Colors.blue.colorize("Aborted attempt at joining a MPGame, the user is arleady in a match"))
            throw ("You are arleady hosting a match yourself.")
        }
        let host = message.mentions.users.first()
        if (!host) {
            console.log("- " + Colors.blue.colorize("Aborted attempt at joining a MPGame, the user did not provide the host they want to join"))
            throw ("You need to ping the person you want to join.")
        }
        if (!this.hosts[host.id]) {
            console.log("- " + Colors.blue.colorize("Aborted attempt at joining a MPGame, the given host is not hosting any match"))
            throw ("Could not find the match.")
        } else if (this.hosts[host.id].joinername != "`none`") {
            console.log("- " + Colors.blue.colorize("Aborted attempt at joining a MPGame, the requested match has arleady a joiner"))
            throw ("Someone is arleady inside this match.")
        }
        this.joiners[message.author.id] = this.hosts[host.id]
        this.joiners[message.author.id].joiner = message.author.id
        this.joiners[message.author.id].joinername = message.author.username
        message.channel.send("Successfully joined " + host.username + "'s match.")
        console.log("- " + Colors.cyan.colorize("Sucessfully joined a MPGame:") +
            "\n\tHost: " + this.hosts[host.id].hostname +
            "\n\tHost ID: " + this.hosts[host.id].host +
            "\n\tJoiner: " + message.author.username +
            "\n\tJoiner ID: " + message.author.id)
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
                    break
                }
            }
            console.log("- " + Colors.cyan.colorize("Sucessfully closed a MPGame:") +
                "\n\tHost: " + this.hosts[id].hostname +
                "\n\tHost ID: " + this.hosts[id].host +
                "\n\tJoiner: " + this.hosts[id].joinername +
                "\n\tJoiner ID: " + this.hosts[id].joiner)
            this.hosts[id] = undefined
            return quitmsg
        } else if (this.joiners[id]) {
            console.log("- " + Colors.cyan.colorize("Sucessfully kicked an user from a MPGame:") +
                "\n\tHost: " + this.joiners[id].hostname +
                "\n\tHost ID: " + this.joiners[id].host +
                "\n\tJoiner: " + this.joiners[id].joinername +
                "\n\tJoiner ID: " + this.joiners[id].joiner)
            this.joiners[id].joiner = undefined
            this.joiners[id].joinername = "`none`"
            this.joiners[id] = undefined
            return quitmsg
        } else {
            console.log("- " + Colors.blue.colorize("Aborted attempt at leaving a MPGame, the user is not inside any match"))
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

module.exports = {
    Game,
    MPGame
}

var normalizedPath = require("path").join(__dirname, "./Minigames");

fs.readdirSync(normalizedPath).forEach(function(file) {
    require("./Minigames/" + file);
  });
  