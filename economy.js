class EconomySystem {
    constructor(username) {
        this.money = 0
        this.rank = 0
        this.user = username
    }

    give(amount, message) {
        this.money = this.money + amount
        if (message) {
            message.channel.send(this.user + " gained " + amount + " DogeCoins!")
        }
    }

    take(amount) {
        this.money = Math.max(this.money - amount, 0)
    }

    rankup(message) {
        let needed = 100 + (100 * this.rank)
        if (this.money >= needed) {
            this.rank = this.rank + 1
            this.take(needed)
            if (message) {
                message.channel.send(this.user + " is now rank " + this.rank + "")
            }
        }
    }
}

Economy = {
    list: {},
    getEconomySystem(user) {
        if (!Economy.list[user.id]){
            Economy.list[user.id] = new getEconomySystem(user.username)
        }
        return Economy.list[user.id]
    }
    /*check: (user) => {
        if (!Economy.list[user.id]) {
            Economy.list[user.id] = new EconomySystem(user.username)
        }
    },
    give: (amount, message) => {
        let user = message.author
        Economy.check(user)
        Economy.list[user.id].give(amount, message)
    },
    take: (amount, message) => {
        let user = message.author
        Economy.check(user)
        if (Economy.list[user.id].check()) {
            Economy.list[user.id].take(amount, message)
        }
    }*/
}