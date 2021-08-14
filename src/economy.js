class FlagSystem {
    constructor(totalflags, flags) {
        this.value = flags ? BigInt(flags) : BigInt(0)
        this.totalflags = totalflags
    }

    toJSON() {
        return this.value.toString()
    }

    addFlag(flag) {
        this.value = this.value | BigInt(flag)
    }

    removeFlag(flag) {
        this.value = this.value & ~BigInt(flag)
    }

    checkFlag(flag) {
        if (this.value & BigInt(flag)) return true
        return false 
    }

    getBinary(replacers1, replacer0) {
        replacers1 = replacers1 || []
        replacers1.reverse()
        let bits = [...this.value.toString(2).padStart(this.totalflags, "0")]
        bits.forEach((bit, position) => {
            if (bit == "1") {
                bits[position] = replacers1[position] || "1"
            } else {
                bits[position] = replacer0 || "0"
            }
        })
        replacers1.reverse()
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
        this.floor = backup.floor || 0,
        this.day = backup.day || Date.now()-Date.day
        this.reversi = backup.reversi || 0
        this.connect4 = backup.connect4 || 0
        this.vhour = backup.vhour || Date.now()-Date.hour
        this.vgot = new FlagSystem(60, backup.vgot)
        this.achievments = new FlagSystem(7, backup.achievments)
    }

    alterValue(flagname, amount, max) {
        this[flagname] = Math.min(this[flagname] + amount, max || Infinity)
    }

    award(name, message) {
        if (!this.achievments.checkFlag(Achievments[name].value)) {
            this.achievments.addFlag(Achievments[name].value)
            message.channel.send(this.user + " just got the \"" + Achievments[name].id + "\" achievement!")
        }
    }

    give(amount, message, nobonus) {
        let pbonus = Math.floor(((amount / 100) * (this.rank - 1)))
        this.money = nobonus ? this.money + amount : this.money + amount + pbonus
        if (message) {
            let msg = this.user + " gained " + amount + " DogeCoins!"
            if (!nobonus) {
                msg = msg + " (+" + pbonus + " bonus)"
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
        if (amount < 1) {
            if (message) {
                message.channel.send("that amount is too low, pal")
            }
            return false
        }
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
    },
    flag: class {
        constructor(id, bit) {
            this.id = id
            this.value = 2 ** bit - 2 ** (bit - 1)
        }
    }
}

Achievments = {
    first: new Economy.flag("<:golden_medal:874402462902128656> reach 1st place in the leaderboard", 1),
    reversi: new Economy.flag("<:black_circle:869976829811884103> win 15 reversi matches", 2),
    connect4: new Economy.flag("<:yellow_circle:870716292515106846> win 15 connect 4 matches", 3),
    crew: new Economy.flag("<:imposter:874402966084395058> eject 25 impostors in crew", 4),
    driller: new Economy.flag("<:driller:874403362827796530> reach tier 29 in driller", 5),
    v_: new Economy.flag("<:v_c:873259417557151765> find all v_s", 6),
    dungeon: new Economy.flag("<:dungeon:875809577487192116> reach floor 50 in dungeon", 7),
}
Achievments.binary = [
    Achievments.first.id + "\n",
    Achievments.reversi.id + "\n",
    Achievments.connect4.id + "\n",
    Achievments.crew.id + "\n",
    Achievments.driller.id + "\n",
    Achievments.v_.id + "\n",
    Achievments.dungeon.id + "\n",
]

for (let ID of Object.keys(Economy.list)) {
    Economy.list[ID] = new EconomySystem(Economy.list[ID].user, Economy.list[ID])
}
