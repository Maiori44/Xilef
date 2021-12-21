const { Command, RequiredArg } = require("../../command");
const { Collection } = require('discord.js')

const players = new Collection()

const suspiciousnessMessages = [
    " is doing his tasks.",
    " is wandering around.",
    " looks at the map, probably lost.",
    " is moving strangely.",
    " goes in medbay.",
    " looks at you.",
    " seems to do his tasks...?",
    " runs away.",
    " is nowhere to be found.",
    " just vented!"
]


const crewNames = ["red", "blue", "green", "pink", "orange", "yellow", "black", "white", "purple", "cyan"]

class AmongusGame {
    constructor() {
        this.turns = 7
        this.killChance = 0
        this.gameOver = false
        this.crew = []

        const suspiciousnesses = [...Array(10).keys()]
        const crewNamesCopy = [...crewNames]

        let iteration = 0
        while (suspiciousnesses.length) {
            const suspiciousness = suspiciousnesses.splice(suspiciousnesses.length * Math.random() | 0, 1)[0]
            const crewName = crewNamesCopy.shift()

            if (suspiciousness == 9)
                this.impostorIndex = iteration

            this.crew.push({
                color: crewName,
                suspiciousness: suspiciousness
            })

            iteration++
        }
    }

    getCrewmate(color) {
        if (this.gameOver)
            return

        const crewmate = this.crew[this.crew.findIndex(crewmate => crewmate.color == color)]

        if (crewmate.suspiciousness >= 5)
            this.killChance += ((crewmate.suspiciousness ** 2) / 20)

        return crewmate
    }

    nextTurn() {
        if (this.gameOver == true)
            return

        if (this.turns < 4)
            this.killChance++

        this.check()
        return this
    }

    getImpostorColor() {
        return this.crew[this.impostorIndex].color
    }

    check() {
        if (this.killChance > 7) {
            this.turns = 0
            this.gameOver = true
            return false
        }

        return true
    }
}

module.exports = [
    new Command({
        name: "crew",
        description: "Find the impostor!",
        category: "Game",
        subCommands: [
            new Command({
                name: "examine",
                description: "(crew) Examine a color and see how sussy they are.",
                category: "Game",
                requiredArgs: [
                    new RequiredArg({
                        errorMsg: "You need to choose the color of the crewmate if you want to do anything to them, " +
                            "possible options are: Red, Blue, Green, Pink, Orange, Yellow, Black, White, Purple, Cyan.",
                        argIndex: 0,
                        argName: "color",
                        validValues: ["red", "blue", "green", "pink", "orange", "yellow", "black", "white", "purple", "cyan"]
                    })
                ],
                async run(message, args, client) {
                    const gameInstance = players.get(message.author.id)
                        ?? players.set(message.author.id, new AmongusGame()).get(message.author.id)

                    if (gameInstance.gameOver) {
                        message.reply("The impostor found you!" + "\nThe impostor was " + gameInstance.getImpostorColor())
                        players.set(message.author.id, new AmongusGame())
                        return
                    }

                    const suspiciousness = gameInstance.getCrewmate(args[0]).suspiciousness

                    message.reply(`${args[0]}${suspiciousnessMessages[suspiciousness]}`)

                    gameInstance.nextTurn()
                }
            }),
            new Command({
                name: "eject",
                description: "(crew) Eject the correct player, or you will lose.",
                category: "Game",
                requiredArgs: [
                    new RequiredArg({
                        errorMsg: "You need to choose the color of the crewmate if you want to do anything to them, " +
                            "possible options are: Red, Blue, Green, Pink, Orange, Yellow, Black, White, Purple, Cyan.",
                        argIndex: 0,
                        argName: "color",
                        validValues: ["red", "blue", "green", "pink", "orange", "yellow", "black", "white", "purple", "cyan"]
                    })
                ],
                async run(message, args, client) {
                    const gameInstance = players.get(message.author.id)
                        ?? players.set(message.author.id, new AmongusGame()).get(message.author.id)

                    args[0] = args[0].toLowerCase()

                    let impostor = gameInstance.getImpostorColor()
                    // const userData = client.economy.getUser(message.author.id)

                    if (args[0] == impostor) {
                        message.reply("You won!")
                    } else {
                        message.reply("You lost!")
                    }

                    players.set(message.author.id, new AmongusGame())
                }
            }),
        ],
        async run(message, args, client) {
            message.reply(
                "`&crew examine (color)` to examine a crewmate, the impostor might find you though...\n" +
                "`&crew eject (color)` to eject a crewmate out, you can only eject once"
            )
        }
    })
]