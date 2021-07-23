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
        if (this.money <= needed) {
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

    rankup(message) {
        let needed = 100 * this.rank
        if (this.take(needed, message, this.user + " is now " + (this.rank + 1), this.name + " needs " + (needed-this.money) + " more DogeCoins for rank " + (this.rank + 1))) {
            this.rank = this.rank + 1
        }
    }
}

Economy = {
    list: {},
    getEconomySystem(user) {
        if (!Economy.list[user.id]) {
            Economy.list[user.id] = new getEconomySystem(user.username)
        }
        return Economy.list[user.id]
    }
}

