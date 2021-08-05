class FlagSystem {
    constructor(totalflags, flags) {
        this.value = flags || 0
        this.totalflags = totalflags
    }

    toJSON() {
        return this.value
    }

    addFlag(flag) {
        this.value = this.value | flag
    }

    removeFlag(flag) {
        this.value = this.value & ~flag
    }

    checkFlag(flag) {
        if (this.value & flag) return true
        return false 
    }

    getBinary(replacers1, replacer0) {
        let bits = [...this.value.toString(2).padStart(this.totalflags, "0")]
        bits.forEach((bit, position) => {
            if (bit == "1") {
                bits[position] = replacers1[position] || "1"
            } else {
                bits[position] = replacer0 || "0"
            }
        })
        return bits.join("")
    }
}

class EconomySystem {
    constructor(username, backup) {
        backup = backup || {}
        this.money = backup.money || 0
        this.rank = backup.rank || 1
        this.user = username
        this.impostors = backup.impostors || 0
        this.driller = backup.driller || 1
        this.day = backup.day || -1
        this.reversi = backup.reversi || 0
        this.connect4 = backup.connect4 || 0
        this.vhour = backup.vhour || -1
        this.vgot = backup.vogt ? new FlagSystem(5, backup.vgot) : new FlagSystem(5)
    }

    alterValue(flagname, amount, max) {
        this[flagname] = Math.min(this[flagname] + amount, max || Infinity)
    }

    give(amount, message, nobonus) {
        this.money = nobonus ? this.money + amount : this.money + amount + Math.floor(((amount / 100) * (this.rank - 1)))
        if (message) {
            let msg = this.user + " gained " + amount + " DogeCoins!"
            if (!nobonus) {
                msg = msg + " (+" + Math.floor(((amount / 100) * (this.rank - 1))) + " bonus)"
            }
            message.channel.send(msg)
        }
    }

    steal(amount, message) {
        this.money = Math.max(this.money - amount, 0)
        if (message) {
            message.channel.send(this.user + " lost " + amount + " DogeCoins!")
        }
    }

    buy(amount, message, tmsg, fmsg) {
        if (this.money >= amount) {
            this.money = this.money - amount
            if (message && tmsg) {
                message.channel.send(tmsg)
            }
            return true
        }
        if (message && fmsg) {
            message.channel.send(fmsg)
        }
        return false
    }
}

const fs = require('fs')
const { setFlagsFromString } = require('v8')

Economy = {
    list: JSON.parse(fs.readFileSync("./src/Data/economy.json", "utf8")),
    getEconomySystem(user) {
        if (!Economy.list[user.id]) {
            Economy.list[user.id] = new EconomySystem(user.username)
        } else if (Economy.list[user.id].user != user.username) {
            Economy.list[user.id].user = user.username
        }
        return Economy.list[user.id]
    },
    save() {
        let json = JSON.parse(fs.readFileSync("./src/Data/economy.json", "utf8"));
        json = { ...json, ...Economy.list }
        fs.writeFileSync("./src/Data/economy.json", JSON.stringify(json, null, 4), "utf8")
    }
}

for (let ID of Object.keys(Economy.list)) {
    Economy.list[ID] = new EconomySystem(Economy.list[ID].user, Economy.list[ID])
}
