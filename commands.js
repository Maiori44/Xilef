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

Commands.whoasked = new Command("Finds out the person who asked", (message, args) => {
    message.channel.send("https://tenor.com/view/meme-who-asked-satellite-looking-radar-gif-17171784")
    message.channel.send("Asking neighbours if they know who asked...")
    setTimeout(() => { message.channel.send("Asking the government if they know who asked...") }, 3000)
    setTimeout(() => { message.channel.send("Asking the aliens if they know who asked...") }, 6000)
    setTimeout(() => { message.channel.send("Asking god if they know who asked...") }, 9000)
    setTimeout(() => { message.channel.send("Asking google if they know who asked...") }, 12000)
    setTimeout(() => { message.channel.send("Yeah no, nobody asked.") }, 15000)
})

//minigame commands

class Game {
    constructor(gamemaker) {
        this.list = {}
        this.makeGame = gamemaker
    }

    getGame(id) {
        if (!this.list[id]) {
            this.list[id] = this.makeGame()
        }
        return this.list[id]
    }
}

class AmogusGame {
    constructor() {
        this.turns = 0
        this.crew = {}
    }

    reset() {
        this.turns = 7
        this.crew.red = Math.ceil(Math.random() * 10)
        this.crew.blue = Math.ceil(Math.random() * 10)
        this.crew.green = Math.ceil(Math.random() * 10)
        this.crew.pink = Math.ceil(Math.random() * 10)
        this.crew.orange = Math.ceil(Math.random() * 10)
        this.crew.yellow = Math.ceil(Math.random() * 10)
        this.crew.black = Math.ceil(Math.random() * 10)
        this.crew.white = Math.ceil(Math.random() * 10)
        this.crew.purple = Math.ceil(Math.random() * 10)
        this.crew.cyan = Math.ceil(Math.random() * 10)
    }

    getSussier() {
        let sussier = 0
        let crewname = ""
        for (let crew in this.crew) {
            if (this.crew[crew] > sussier) {
                sussier = this.crew[crew]
                crewname = crew
            }
        }
        return crewname
    }
}

Amongus = new Game(() => {
    let Amogus = new AmogusGame()
    Amogus.reset()
    return Amogus
})

Commands.crew = new Command("Find the imposter!", (message, args) => {
    let Amogus = Amongus.getGame(message.author.id)
    let aturn = Amogus.turns
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
                EconomySystem.give(250 - (5 * aturn), message)
                Amogus.reset()
                return
            } else {
                message.channel.send(args[1] + " is not the impostor...")
                Amogus.turns = 0
            }
            break
        }
        default: {
            message.channel.send("`&crew examine (color)` to examine a crewmate, the impostor might find you though...\n`&crew eject (color)` to eject a crewmate out, you can only eject once")
            return
        }
    }
    Amogus.turns = Math.max(Amogus.turns - 1, 0)
    if (Amogus.turns == 0) {
        message.channel.send("The impostor killed you!\nThe impostor was " + Amogus.getSussier() + ".\nGame over.")
        let EconomySystem = Economy.getEconomySystem(message.author)
        EconomySystem.steal(80 - (10 * aturn), message)
        Amogus.reset()
    } else {
        message.channel.send(Amogus.turns + " turns left.")
    }
}, [new RequiredArg(0, "`&crew examine (color)` to examine a crewmate, the impostor might find you though...\n`&crew eject (color)` to eject a crewmate out, you can only eject once"),
new RequiredArg(1, "You need to choose the color of the crewmate if you want to do anything to them, " +
    "possible options are: Red, Blue, Green, Pink, Orange, Yellow, Black, White, Purple, Cyan.")])

class DrillerGame {
    constructor() {
        this.depth = 0
        this.cash = 0
        this.hp = 100
    }

    reset() {
        this.depth = 0
        this.cash = 0
        this.hp = 100
    }
}

Driller = new Game(() => { return new DrillerGame() })
const DrillerTreasures = [
    "Coal",
    "Tin",
    "Bronze",
    "Iron",
    "Silver",
    "Tungsten",
    "Gold",
    "Platinum",
    "Diamond",
    "a ton of DogeCoins"
]

Commands.driller = new Command("Dig deeper and deeper to find the treasures", (message, args) => {
    let DrillerGame = Driller.getGame(message.author.id)
    let EconomySystem = Economy.getEconomySystem(message.author)
    args[0] = args[0].toLowerCase()
    switch (args[0]) {
        case "stats": {
            message.channel.send("Your driller stats:\ndepth: " + DrillerGame.depth + "\ncash found: " + DrillerGame.cash + "\nhealth: " + DrillerGame.hp)
            break
        }
        case "dig": {
            if (DrillerGame.depth > 9) {
                message.channel.send("Your driller reached bedrock, it can't dig any further!")
                return
            }
            DrillerGame.depth++
            let hurtchance = (Math.random() * 20)
            if (hurtchance > DrillerGame.depth) {
                message.channel.send("Your driller digs deeper..and finds " + DrillerTreasures[DrillerGame.depth - 1] + "! (worth " + 20 * DrillerGame.depth + ")")
                DrillerGame.cash = DrillerGame.cash + (20 * DrillerGame.depth)
                if (DrillerGame.depth > 9) {
                    DrillerGame.cash = DrillerGame.cash + 200
                }
            } else {
                message.channel.send("Your driller digs deeper..and finds lava! Your driller got damaged!")
                DrillerGame.hp = DrillerGame.hp - (10 * DrillerGame.depth)
            }
            if (DrillerGame.depth > 9) {
                message.channel.send("Your driller reached bedrock, it can't dig any further!")
            }
            break
        }
        case "repair": {
            if (DrillerGame.hp == 100) {
                message.channel.send("Your driller is arleady in perfect condition.")
            } else if (EconomySystem.buy(50, message, "Your driller recovered 50 hp! (50 DogeCoins spent)", "You don't have enough DogeCoins to repair your driller (50 DogeCoins needed)")) {
                DrillerGame.hp = Math.min(DrillerGame.hp + 50, 100)
            }
            break
        }
        case "cashin": {
            message.channel.send("Your driller comes back, and gives you all the DogeCoins it had collected.")
            EconomySystem.give(DrillerGame.cash, message)
            DrillerGame.reset()
            break
        }
        default: {
            message.channel.send("`&driller stats` says the stats of your driller\n`&driller dig` makes the driller dig deeper, finding treasures..or traps!\n`&driller repair` repairs the driller, it won't be free though (costs 50 DogeCoins)\n`&driller cashin` get all the DogeCoins the driller got, and reset the game")
            return
        }
    }
    if (DrillerGame.hp < 1) {
        message.channel.send("Your driller broke! It lost whatever it had collected.")
        EconomySystem.steal(150, message)
        DrillerGame.reset()
    }
}, [new RequiredArg(0, "`&driller stats` says the stats of your driller\n`&driller dig` makes the driller dig deeper, finding treasures..or lava!\n`&driller repair` repairs the driller, it won't be free though (costs 50 DogeCoins)\n`&driller cashin` get all the DogeCoins the driller got, and reset the game")])

/*
T1 (lava chance 8%, 1 durability loss, drill cost 0, depth 0-9)
Copper - 10
Tin - 15
Iron - 20
Lead - 30
Silver - 30
Tungsten - 45
Gold - 50
Platinum - 75
T2 (lava chance 16%, 2-3 durability loss, drill cost 1000, depth 10-19)
Amethyst - 100
Topaz - 110
Saphire - 125 (forgot if saphire or emerald is rarer lol)
Emerald - 135
Ruby - 150
Diamond - 160
Amber - 175
T3 (lava chance 32%, durability loss 4-9, drill cost 5000, depth 20-29)
Cobalt - 250
Palladium - 300
Mythrill - 400
Orichalcum - 450
Adamantite - 500
Titanium - 600
T4 (lava chance 64%, durability loss 8-27%, drill cost 16000, depth 30+)
Hallowed ore - 750
Chlorophyte - 1000
Shroomite - 1100
Spectre ore - 1200
Luminite - 2500
*/

//economy commands

/*function FindUser(user1, user2) {
    let targetId = args[0]?.match(/<@!?([0-9]{18})>/)?[1]
    if (client.users.cache.get(targetId)) {
      // user exists
    } else {
      // user doesnt exist
    }
}*/

Commands.stats = new Command("Gets your amount of money and your rank", (message, args) => {
    let user = message.mentions.users.first() || message.author
    let EconomySystem = Economy.getEconomySystem(user)
    message.channel.send(EconomySystem.user + " has " + EconomySystem.money + " DogeCoins, and is rank " + EconomySystem.rank)
})

Commands.rankup = new Command("Increases your rank if you have enough money", (message, args) => {
    let EconomySystem = Economy.getEconomySystem(message.author)
    let needed = 100 * EconomySystem.rank
    if (EconomySystem.buy(needed, message, EconomySystem.user + " is now rank " + (EconomySystem.rank + 1) + "!", EconomySystem.user + " needs " + (needed - EconomySystem.money) + " more DogeCoins for rank " + (EconomySystem.rank + 1))) {
        EconomySystem.rank = EconomySystem.rank + 1
    }
})

Commands.gamble = new Command("Gamble your money away cause you have a terrible life", (message, args) => {
    let gamble = parseInt(args[0])
    if (isNaN(gamble)) {
        throw ("That is definitively not a number")
    } else if (gamble <= 5) {
        throw ("That number is a bit too low.")
    }
    let EconomySystem = Economy.getEconomySystem(message.author)
    if (EconomySystem.buy(gamble, message, null, "You don't have enough DogeCoins to gamble " + gamble)) {
        let chance = Math.ceil(Math.random() * (gamble * 2))
        if (gamble >= 2500) {
            chance = chance - (gamble / 2)
        }
        if (chance > gamble + (5 + gamble/100)) {
            message.channel.send("Oh wow you're lucky")
            EconomySystem.give(gamble, null, true)
            EconomySystem.give(gamble * 2, message, true)
        } else {
            message.channel.send("Nope, you lost.")
        }
    }
}, [new RequiredArg(0, "You can't gamble air, choose an amount")])

Commands.leaderboard = new Command("See the users with the highest ranks", (message, args) => {
    let leaderboard = Object.keys(Economy.list).sort((a, b) => { return Economy.list[b].rank - Economy.list[a].rank })
    let lbstring = ""
    for (let ID of leaderboard) {
        lbstring = lbstring + "`" + Economy.list[ID].user + "`" + ": rank **" + Economy.list[ID].rank + "** (" + Economy.list[ID].money + " DogeCoins)\n"
    }
    message.channel.send(lbstring)
})