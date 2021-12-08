const { RequiredArg, Command } = require("./../commands.js")
const { Matrix } = require("./../matrix.js")

class ClashMatrix extends Matrix {
    constructor(data) {
        super(10, 10, ":black_large_square:")
        let udata = ""
        for (let i = 0; i < data.length; i++) {
            const amount = parseInt(data[i++])
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
                data += amount + building
                currentBuilding = building
                amount = 1
            }
        }
    }
}

exports.ClashMatrix = ClashMatrix

Clash = {
    buildings: {
        T: "these texts",
        M: "are placeholders",
        C: "for when",
        X: "the emojies",
        B: "will be read"
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
    const command = args[0].toLowerCase()
    switch (command) {
        /*"**Town Hall:**\n\tevery village has only one, an attacker will steal all your collected DogeCoins if you don't protect it!\n\n" +
                "**DogeCoin Mine:**\n\tsomehow extracts DogeCoins from underground, protect it from attackers!\n\n" +
                "**Cannon:** "*/
        case "buildings": {
            const InfoEmbed = new Discord.MessageEmbed()
                .setColor("#FFA500")
                .setTitle("Buildings")
                .setDescription(`Every building costs ${500 * Economy.getEconomySystem(message.user).rank} to build and you can only have 30 of every building\nexcept the town hall, there is and must always be one for every village`)
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