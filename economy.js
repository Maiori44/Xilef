class EconomySystem {
    constructor(username, money, rank) {
        this.money = money || 0
        this.rank = rank || 1
        this.user = username
    }

    give(amount, message) {
        this.money = this.money + amount
        if (message) {
            message.channel.send(this.user + " gained " + amount + " DogeCoins!")
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

Economy = {
    list: JSON.parse(fs.readFileSync("money.json", "utf8")),
    getEconomySystem(user) {
        if (!Economy.list[user.id]) {
            Economy.list[user.id] = new EconomySystem(user.username)
        }
        return Economy.list[user.id]
    },
    save() {
        let json = JSON.parse(fs.readFileSync("./money.json", "utf8"));
        json = {...json, ...Economy.list}
        fs.writeFileSync("./money.json", JSON.stringify(json, null, 4), "utf8")
    }
}

for (let ID of Object.keys(Economy.list)) {
    Economy.list[ID] = new EconomySystem(Economy.list[ID].user, Economy.list[ID].money, Economy.list[ID].rank)
}