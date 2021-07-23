class EconomySystem {
    constructor(username) {
        this.money = 0
        this.rank = 1
        this.user = username
    }

    give(amount, message) {
        this.money = this.money + amount
        if (message) {
            message.channel.send(this.user + " gained " + amount + " DogeCoins!")
        }
    }

    take(amount, message, tmsg, fmsg) {
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

Economy = {
    list: {},
    getEconomySystem(user) {
        if (!Economy.list[user.id]) {
            Economy.list[user.id] = new EconomySystem(user.username)
        }
        return Economy.list[user.id]
    }
}

