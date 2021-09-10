const { RequiredArg, Command } = require("./../commands.js")
const fs = require("fs")

Stocks = {
    help:
        "`&stocks show` show general info about the current status of the Xilefunds\n" +
        "`&stocks offer (price)` offer a price to buy the Xilefunds, has to be higher than the previous\n" +
        "`&stocks auction (lowest price)` starts a new auction, if the lowest price is omitted Xilefunds's current value is used",
    auction: { seller: "", buyer: "", price: 0 },
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
    switch (sus) {
        case "show": {
            const StocksEmbed = new Discord.MessageEmbed()
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