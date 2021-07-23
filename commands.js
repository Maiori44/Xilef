const Discord = require("discord.js")

class RequiredArg {
    constructor(argnum, errormsg) {
        this.argnum = argnum
        this.errormsg = errormsg
    }

    check(args) {
        if (args[this.argnum]) { return true }
        throw (this.errormsg)
    }
}

class Command {
    constructor(description, action, requiredargs) {
        this.description = description
        this.action = action
        this.requiredargs = requiredargs
    }

    call(message, args) {
        if (this.requiredargs) {
            for (const arg of this.requiredargs) {
                arg.check(args)
            }
        }
        this.action(message, args)
    }
}

Commands = {}

//simple message commands

Commands.help = new Command("Shows a list of all commands", (message, args) => {
    message.reply("Here is a list of all commands I can do:\n" + Object.entries(Commands).map(([name, command]) => "`" + name + "`: " + command.description).join("\n"))
})

Commands.hi = new Command("Says hi to you", (message, args) => {
    message.reply("Hi.")
})

Commands.annoy = new Command("Annoys the person you want", (message, args) => {
    message.channel.send(args[0].slice(0, 1900) + " you suck")
}, [new RequiredArg(0, "You gotta give me someone dumdum")])

Commands.comfort = new Command("Comforts the person you want", (message, args) => {
    message.channel.send(args[0].slice(0, 1900) + " you don't suck")
}, [new RequiredArg(0, "You gotta give me someone dumdum")])

Commands.say = new Command("Says whatever you want", (message, args) => {
    if (!args.join(" ")) { args[0] = "** **" }
    message.channel.send(args.join(" ").slice(0, 1900))
    message.delete()
}, [new RequiredArg(0, "** **")])

Commands.hentai = new Command("Totally sends you hentai", (message, args) => {
    message.channel.send("No..just no..")
})

//math commands

Commands.dice = new Command("Gives you a number from 1 to 6, and maybe judge your result", (message, args) => {
    let randomnum = Math.ceil(Math.random() * 6)
    message.channel.send(message.author.username + " rolled " + randomnum)
    switch (randomnum) {
        case 1:
            message.channel.send("boy you suck")
            break
        case 6:
            message.channel.send("damn u lucky")
            break
    }
})

Commands.clown = new Command("Given a person or a thing, the bot will say how much of a clown it is", (message, args) => {
    let name = args[0] || message.author.username
    let clownvalue = name.length + (Date.now() % 50)
    for (var i = 0; i < name.length; i++) {
        clownvalue = clownvalue + name.charCodeAt(i)
    }
    clownvalue = (clownvalue % 1000) / 10
    message.channel.send(name + " is a clown at " + clownvalue + "%")
    switch (Math.floor(clownvalue)) {
        case 0:
            message.channel.send("Wow, " + name + " is not a clown, " + name + " is an absolute chad")
            break
        case 69:
            message.channel.send("Noice.")
            break
        case 100:
            message.channel.send("Wow, " + name + " is not a clown, " + name + " is the entire circus")
            break
    }
}, [new RequiredArg(0, "You're a clown at 100%, since you didn't even give me something or someone")])

//images commands

const chadimage = new Discord.MessageAttachment("giga chad.jpg")

Commands.chad = new Command("Sends a beautiful giga chad", (message, args) => {
    message.channel.send("epik")
    message.channel.send(chadimage)
})

const amogusimage = new Discord.MessageAttachment("amogus.gif")

Commands.amogus = new Command("It's pretty sus", (message, args) => {
    message.channel.send("sus")
    message.channel.send(amogusimage)
})

const sdrogoimage = new Discord.MessageAttachment("sdrogo.jpg")

Commands.sdrogo = new Command("Sdrogo man is da wae", (message, args) => {
    message.channel.send("hm yes")
    message.channel.send(sdrogoimage)
})

const vshitimage = new Discord.MessageAttachment("vshit.png")

Commands.vshit = new Command("Vsauce here", (message, args) => {
    message.channel.send("hey vsauce, Michael here, could you get out of my bathroom?")
    message.channel.send(vshitimage)
})

const uwuimage = new Discord.MessageAttachment("uwu.png")

Commands.uwu = new Command("Sends a super cute kawaii image ^w^", (message, args) => {
    message.channel.send(":3")
    message.channel.send(uwuimage)
})

//Among us minigame

let Amogus = {
    turns: 0,
    crew: {},
    reset() {
        Amogus.turns = 7
        Amogus.crew.red = Math.ceil(Math.random() * 10)
        Amogus.crew.blue = Math.ceil(Math.random() * 10)
        Amogus.crew.green = Math.ceil(Math.random() * 10)
        Amogus.crew.pink = Math.ceil(Math.random() * 10)
        Amogus.crew.orange = Math.ceil(Math.random() * 10)
        Amogus.crew.yellow = Math.ceil(Math.random() * 10)
        Amogus.crew.black = Math.ceil(Math.random() * 10)
        Amogus.crew.white = Math.ceil(Math.random() * 10)
        Amogus.crew.purple = Math.ceil(Math.random() * 10)
        Amogus.crew.cyan = Math.ceil(Math.random() * 10)
    },
    getSussier() {
        let sussier = 0
        let crewname = ""
        for (let crew in Amogus.crew) {
            if (Amogus.crew[crew] > sussier) {
                sussier = Amogus.crew[crew]
                crewname = crew
            }
        }
        return crewname
    }
}

Amogus.reset()

Commands.crew = new Command("Find the imposter!", (message, args) => {
    args[1] = args[1].toLowerCase()
    switch (args[0]) {
        case "examine": {
            if (!Amogus.crew[args[1]]) { message.channel.send(args[1] + " does not exist, lol"); return }
            let killchance = (Math.random() * 10) - Amogus.turns
            switch (Amogus.crew[args[1]]) {
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
            let impostor = Amogus.getSussier()
            if (!Amogus.crew[args[1]]) { message.channel.send(args[1] + " does not exist, lol"); return }
            else if (args[1] == impostor || Amogus.crew[args[1]] == 10) {
                message.channel.send(args[1] + " was the impostor! congrats!")
                let EconomySystem = Economy.getEconomySystem(message.author)
                EconomySystem.give(50 + (Amogus.turns * 10), message)
                Amogus.reset()
                return
            } else {
                message.channel.send(args[1] + " is not the impostor...")
                Amogus.turns = 0
            }
            break
        }
        case "reset": {
            if (args[1] == "yes") {
                message.channel.send("The game has been resetted, The impostor was " + Amogus.getSussier())
                Amogus.reset()
            } else {
                message.channel.send("I need you to confirm this, type `&crew reset yes`")
            }
            return
        }
        default: {
            message.channel.send("`&crew examine (color)` to examine a crewmate, the impostor might find you though...\n`&crew eject (color)` to eject a crewmate out, you can only eject once\n`&crew reset yes` to reset the game")
            return
        }
    }
    Amogus.turns = Math.max(Amogus.turns - 1, 0)
    if (Amogus.turns == 0) {
        message.channel.send("The impostor killed you!\nThe impostor was " + Amogus.getSussier() + ".\nGame over.")
        Amogus.reset()
    } else {
        message.channel.send(Amogus.turns + " turns left.")
    }
}, [new RequiredArg(0, "`&crew examine (color)` to examine a crewmate, the impostor might find you though...\n`&crew eject (color)` to eject a crewmate out, you can only eject once\n`&crew reset yes` to reset the game"),
new RequiredArg(1, "You need to choose the color of the crewmate if you want to do anything to them, " +
    "possible options are: Red, Blue, Green, Pink, Orange, Yellow, Black, White, Purple, Cyan.")])

//economy commands

Commands.stats = new Command("Gets your amount of money and your rank", (message, args) => {
    let EconomySystem = Economy.getEconomySystem(message.author)
    if (args[0] != "debug") {
        message.channel.send(EconomySystem.user + " has " + EconomySystem.money + " DogeCoins, and is rank " + EconomySystem.rank)
    } else {
        message.channel.send(JSON.stringify(Economy.list))
    }
})

Commands.rankup = new Command("Increases your rank if you have enough money", (message, args) => {
    let EconomySystem = Economy.getEconomySystem(message.author)
    EconomySystem.rankup(message)
})