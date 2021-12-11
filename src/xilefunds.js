const { RequiredArg, Command } = require("./commands.js")
const fs = require("fs")

Stocks = {
    help:
        "`&stocks show` show general info about the current status of the Xilefunds\n" +
        "`&stocks offer (price)` offer a price to buy the Xilefunds, has to be higher than the previous\n" +
        "`&stocks auction (lowest price)` starts a new auction, if the lowest price is omitted Xilefunds's current value is used",
    auction: {
        seller: undefined,
        sellerid: undefined,
        buyer: undefined,
        buyerid: undefined,
        price: undefined
    },
    timeout: undefined,
    get ledger() {
        return JSON.parse(fs.readFileSync("./src/Data/xilefunds.json", "utf8"))
    },
    get value() {
        const Ledger = Stocks.ledger
        return Ledger[Ledger.length - 1].price
    }
}

Commands.stocks = new Command("Buy and sell Xilefunds\n\n" + Stocks.help, (message, args) => {
    const EconomySystem = Economy.getEconomySystem(message.author)
    switch (args[0]) {
        case "show": {
            let msg = "```diff\n"
            const Ledger = Stocks.ledger
            const ledgerlength = Ledger.length
            let oldvalue = Ledger[ledgerlength - 11].price
            for (let i = ledgerlength - 10; i < ledgerlength; i++) {
                const Transaction = Ledger[i]
                msg = `${msg}${Transaction.price > oldvalue ? "+" : "-"} ${Math.abs((Transaction.price - oldvalue) / oldvalue * 100).toFixed(2)}% => [${Transaction.price}] (${Transaction.seller} -> ${Transaction.buyer}) ${i == ledgerlength - 1 ? "CURRENT" : ""}\n`
                oldvalue = Transaction.price
            }
            msg += "```"
            const StocksEmbed = new Discord.MessageEmbed()
                .setColor("#0368f8")
                .setTitle("Xilefunds' stock market")
                .setDescription(msg)
                .setTimestamp()
            if (Stocks.auction.seller) {
                StocksEmbed.addField("Current auction:", `Seller: ${Stocks.auction.seller}\nLatest offer: ${Stocks.auction.buyer ? (Stocks.auction.buyer + " -> " + Stocks.auction.price) : "`none` (lowest offer possible: " + (Stocks.auction.price + 1) + ")"}`)
                StocksEmbed.setFooter("The auction will end in " + Time.convertTime(Math.floor(Stocks.timeout._idleTimeout - ((process.uptime() * 1000) - Stocks.timeout._idleStart))))
            } else StocksEmbed.setFooter("Start an auction to sell your Xilefund!")
            message.channel.send({ embeds: [StocksEmbed] })
            return
        }
        case "offer": {
            if (Stocks.auction.seller == undefined) {
                message.channel.send("There isn't any auction at the moment, start your own!")
                return
            } else if (Stocks.auction.seller == message.author.username) {
                message.channel.send("You can't offer in your own auction!")
                return
            }
            const offer = parseInt(args[1])
            if (isNaN(offer)) {
                message.channel.send("That is not a valid offer")
                return
            } else if (offer <= Stocks.auction.price) {
                message.channel.send("Your offer is too low, you have to offer something higher than the current offer (" + Stocks.auction.price + ")")
                return
            } else if (EconomySystem.money < offer) {
                message.channel.send("You can't offer money that you don't even have!")
                return
            }
            Stocks.auction.buyer = message.author.username
            Stocks.auction.buyerid = message.author.id
            Stocks.auction.price = offer
            message.channel.send("You successfully offered " + offer + " to this auction!")
            return
        }
        case "auction": {
            if (Stocks.auction.seller != undefined) {
                message.channel.send("There is already another auction going at the moment")
                return
            } else if (EconomySystem.xilefunds < 1) {
                message.channel.send("You don't have any Xilefund to auction!")
                return
            }
            const price = args[1] || Stocks.value
            if (price < 1) {
                message.channel.send("uhh...you can't give this away for free...")
                return
            }
            Stocks.auction.seller = message.author.username
            Stocks.auction.sellerid = message.author.id
            Stocks.auction.price = price
            Stocks.timeout = setTimeout(() => {
                message.author.createDM().then((SellerDMChannel) => {
                    if (Stocks.auction.buyer == undefined) {
                        SellerDMChannel.send("It seems like nobody wanted to buy your xilefund, how sad...\n" +
                            (Stocks.auction.price <= 50 ? "it was even at such a low price..." : "maybe you have to lower the price a little?"))
                        return
                    }
                    client.users.cache.get(Stocks.auction.buyerid).createDM().then((BuyerDMChannel) => {
                        const BuyerEconomySystem = Economy.getEconomySystem({ id: Stocks.auction.buyerid, username: Stocks.auction.buyer })
                        if (BuyerEconomySystem.buy(Stocks.auction.price, undefined, undefined, undefined, true)) {
                            EconomySystem.give(Stocks.auction.price, undefined, true)
                            EconomySystem.alterValue("xilefunds", -1)
                            BuyerEconomySystem.alterValue("xilefunds", 1)
                            fs.writeFileSync("./src/Data/xilefunds.json", JSON.stringify([...Stocks.ledger, Stocks.auction], null, 4), 'utf8')
                            SellerDMChannel.send("You sucessfully sold your Xilefund to " + Stocks.auction.buyer + " for " + Stocks.auction.price + "!")
                            BuyerDMChannel.send("You successfully bought a Xilefund for " + Stocks.auction.price + "!")
                        } else {
                            SellerDMChannel.send("Looks like the person who won the auction didn't even have the money for it...what a scam")
                            BuyerDMChannel.send("The auction ended, but you didn't have enough money for the Xilefund, watch out next time!")
                        }
                        Stocks.auction = {
                            seller: undefined,
                            sellerid: undefined,
                            buyer: undefined,
                            buyerid: undefined,
                            price: undefined
                        }
                    })
                })
            }, Time.hour)
            message.channel.send("You successfully started an auction!")
            return
        }
        default: {
            message.channel.send(Stocks.help.replace(/\&/g, Prefix.get(message.guild.id)))
            return
        }
    }
}, "Economy", [
    new RequiredArg(0, Stocks.help, "command"),
    new RequiredArg(1, undefined, "argument", true)
])
