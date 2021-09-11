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
    get ledger() {
        return JSON.parse(fs.readFileSync("./src/Data/xilefunds.json", "utf8"))
    },
    get value() {
        const Ledger = Stocks.ledger
        return Ledger[Ledger.length - 1].value
    }
}

Commands.stocks = new Command("Buy and sell Xilefunds\n\n" + Stocks.help, (message, args) => {
    const EconomySystem = Economy.getEconomySystem(message.author)
    //message.channel.send(JSON.stringify(Stocks.ledger.length))
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
            msg = msg + "```"
            const StocksEmbed = new Discord.MessageEmbed()
                .setColor("#0368f8")
                .setTitle("Xilefunds' stock market")
                .setDescription(msg)
                .setTimestamp()
            message.channel.send(StocksEmbed)
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