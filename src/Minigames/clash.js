const { RequiredArg, Command } = require("./../commands.js")
const { Matrix } = require("./../matrix.js")

class ClashMatrix extends Matrix {
    constructor(data) {
        super(10, 10, ":black_large_square:")
        let udata = ""
        for (let i = 0; i < data.length; i++) {
            const amount = data[i++].charCodeAt()
            const char = data[i]
            udata += char.repeat(amount)
        }
        let pos = 0
        for (const Cell of this) {
            Cell.value = udata[pos]
            pos++
        }
    }

    toJSON() {
        let currentBuilding = this.at(0, 0)
        let amount = 0
        let data = ""
        for (const Cell of this) {
            const building = Cell.value
            if (building == currentBuilding) amount++
            else {
                data += String.fromCharCode(amount) + currentBuilding
                currentBuilding = building
                amount = 1
            }
        }
        data += String.fromCharCode(amount) + currentBuilding
        return data
    }

    toEmbed(name) {
        const MatrixEmbed = new Discord.MessageEmbed()
            .setColor("#FFA500")
            .setTitle(name + "'s village")
            .setDescription(this.map((Cell) => {return Clash.emojis[Cell.value]}).toString())
        return MatrixEmbed
    }

    getTotal(building) {
        let amount = 0
        for (const Cell of this) {
            if (Cell.value == building) amount++
        }
        if (amount > 30) throw "Something seems to be either broken or corrupted, please contact my creator (**Felix44#0073**)"
        return amount
    }
}

exports.ClashMatrix = ClashMatrix

Clash = {
    emojis: {
        N: ":green_square:",
        T: "<:townhall:919125796868743210>",
        M: ":mine:",
        C: ":cannon:",
        X: ":crossbow:",
        B: ":barracks:"
    },
    buildings: {
        "mine": "M",
        "dogecoin mine": "M",
        "cannon": "C",
        "x-bow": "X",
        "x bow": "X",
        "crossbow": "X",
        "cross bow": "X",
        "barracks": "B",
        "barrack": "B"
    },
    help:
        "`&clash show [@user]` shows your/the pinged user's village\n" +
        "`&clash buildings` shows a list of all buildings and what they do\n" +
        "`&clash build (name) (x) (y)` places the desired building in the given location\n" +
        "`&clash cashin` collects all the money your mines did\n" +
        "`&clash attack (@user) (power) (x)` attacks the pinged user at the given x\n" +
        "the attack will target the southest building in the given x\n" +
        "the more power the attack is the more it can survive the defenses\n" +
        "but more power requires more barracks and more money"
}

Commands.clash = new Command("Build your village and attack other's!\n\n" + Clash.help, (message, args) => {
    const EconomySystem = Economy.getEconomySystem(message.author)
    const ClashMatrix = EconomySystem.clash
    const command = args[0].toLowerCase()
    switch (command) {
        case "show": {
            message.channel.send({ embeds: [ClashMatrix.toEmbed(EconomySystem.user) ]})
            break
        }
        case "build": {
            const building = Clash.buildings[args[1].toLowerCase()]
            if (!building) {
                message.channel.send("I have no clue what a " + args[1] + " is.\nIf you have no clue what you can build either, try `&clash buildings`".replace(/\&/g, Prefix.get(message.guild.id)))
            }
            const total = ClashMatrix.getTotal(building)
            if (total == 30) {message.channel.send("You already build 30 of these, you can't build more"); return}
            const x = parseInt(args[2])
            const y = parseInt(args[3])
            if (isNaN(x) || isNaN(y)) {
                message.channe.send("Now that position you just gave me...it doesn't make sense")
                return
            }
            if (!ClashMatrix.checkBounds(x, y)) {
                message.channel.send("Now that position you just told me...it's out of bounds")
                return
            }
            const price = 500 * EconomySystem.rank
            if (EconomySystem.buy(price, message, "Sucessfully built your " + args[1], "You lack money for this building, you need " + price)) {
                ClashMatrix.set(x, y, building)
            }
            break
        }
        case "buildings": {
            const InfoEmbed = new Discord.MessageEmbed()
                .setColor("#FFA500")
                .setTitle("Buildings")
                .setDescription(`Every building costs ${500 * EconomySystem.rank} to build and you can only have 30 of every building\nexcept the town hall, there is and must always be one for every village`)
                .addFields(
                    {
                        name: "Town Hall",
                        value: "an attacker will steal all the DogeCoins in your mines if you don't protect it!",
                        inline: true
                    },
                    {
                        name: "DogeCoin Mine",
                        value: "somehow extracts DogeCoins from underground, protect it from attackers!",
                        inline: true
                    },
                    {
                        name: "Cannon",
                        value: "powerful defense, can only shoot downwards",
                        inline: true
                    },
                    {
                        name: "CrossBow",
                        value: "not as powerful as a cannon, but can shoot everywhere",
                        inline: true
                    },
                    {
                        name: "Barracks",
                        value: "increases the max power you can use in an attack by 3",
                        inline: true
                    }
                )
            message.channel.send({ embeds: [InfoEmbed] })
            return
        }
        default: message.channel.send(Clash.help.replace(/\&/g, Prefix.get(message.guild.id)))
    }
}, "Game", [
    new RequiredArg(0, Clash.help, "command"),
    new RequiredArg(1, undefined, "arg 1", true),
    new RequiredArg(2, undefined, "arg 2", true),
    new RequiredArg(3, undefined, "arg 3", true),
])