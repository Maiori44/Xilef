const { RequiredArg, Command, Commands } = require("./../commands.js")
const { Game, MPGame } = require("./../minigames.js")

const crewmateNames = ['red', 'blue', 'green', 'pink', 'orange', 'yellow', 'black', 'white', 'purple', 'cyan']

const helpMessage =
    "`&crew examine (color)` to examine a crewmate, the impostor might find you though...\n" +
    "`&crew eject (color)` to eject a crewmate out, you can only eject once"

const Amongus = new Game(() => {
    let Amogus = new AmogusGame()
    Amogus.reset()
    return Amogus
})

class AmogusGame {
    turns = 0
    crew = []
    impostorIndex = 0

    reset() {
        this.crew = []

        this.turns = 7

        const sussinessPool = [...Array(11).keys()].splice(0).sort((a, b) => 0.5 - Math.random()) // get stack overflown

        crewmateNames.forEach((crewmateName, index) => {

            const crewmateSussiness = sussinessPool.pop()

            if (crewmateSussiness == 10) {
                this.impostorIndex = index;
            } 
            
            const crewmate = {
                crewname: crewmateName,
                sussiness: crewmateSussiness
            }

            this.crew.push(crewmate)
        })
    }
}



Commands.crew = new Command("Find the imposter!\n\n" + helpMessage + "\nPossible options for crewmates are: Red, Blue, Green, Pink, Orange, Yellow, Black, White, Purple, Cyan.", (message, args) => {
    let Amogus = Amongus.getGame(message.author.id)
    let aturn = Amogus.turns
    args[1] = args[1].toLowerCase()
    const target = Amogus.crew.find(m => m.crewname === args[1])
    if (!target) {
        message.channel.send(args[1] + " does not exist, lol");
        return
    }
    switch (args[0]) {
        case "examine": {
            let killchance = (Math.random() * 10) - Amogus.turns
            switch (target.sussiness) {
                case 1: {
                    message.channel.send(args[1] + " is doing his tasks.")
                    break
                }
                case 2: {
                    message.channel.send(args[1] + " is wandering around.")
                    break
                }
                case 3: {
                    message.channel.send(args[1] + " looks at the map, probably lost.")
                    break
                }
                case 4: {
                    message.channel.send(args[1] + " is moving strangely.")
                    break
                }
                case 5: {
                    message.channel.send(args[1] + " goes in medbay.")
                    killchance = killchance + 0.5
                    break
                }
                case 6: {
                    message.channel.send(args[1] + " looks at you.")
                    killchance = killchance + 0.7
                    break
                }
                case 7: {
                    message.channel.send(args[1] + " seems to do his tasks..?")
                    killchance = killchance + 1
                    break
                }
                case 8: {
                    message.channel.send(args[1] + " runs away.")
                    killchance = killchance + 2
                    break
                }
                case 9: {
                    message.channel.send(args[1] + " is nowhere to be found.")
                    killchance = killchance + 3
                    break
                }
                case 10: {
                    message.channel.send(args[1] + " just vented!")
                    killchance = killchance + 4
                    break
                }
            }
            if (killchance > 7) {
                Amogus.turns = 0
                message.channel.send("While you were examining " + args[1] + ", the impostor finds you!")
            }
            break
        }
        case "eject": {
            let impostor = Amogus.crew[Amogus.impostorIndex].crewname

            if (target.crewname == impostor || target.sussiness == 10) {
                message.channel.send(args[1] + " was the impostor! congrats!")
                let EconomySystem = Economy.getEconomySystem(message.author)
                EconomySystem.give(120 - (10 * aturn), message)
                EconomySystem.alterValue("impostors", 1)
                if (EconomySystem.impostors >= 25) {
                    EconomySystem.award("crew", message)
                }
                Amogus.reset()
                return
            } else {
                message.channel.send(args[1] + " is not the impostor...")
                Amogus.turns = 0
            }
            break
        }
        default: {
            message.channel.send(Amongus.help.replace(/\&/g, Prefix.get(message.guild.id)))
            return
        }
    }
    Amogus.turns = Math.max(Amogus.turns - 1, 0)
    if (Amogus.turns == 0) {
        message.channel.send("The impostor killed you!\nThe impostor was " + Amogus.crew[Amogus.impostorIndex].crewname + ".\nGame over.")
        let EconomySystem = Economy.getEconomySystem(message.author)
        EconomySystem.steal(30 + (10 * aturn), message)
        Amogus.reset()
    } else {
        message.channel.send(Amogus.turns + " turns left.")
    }

}, "Game", [new RequiredArg(0, helpMessage, "command"),
new RequiredArg(1, "You need to choose the color of the crewmate if you want to do anything to them, " +
    "possible options are: Red, Blue, Green, Pink, Orange, Yellow, Black, White, Purple, Cyan.", "color")])