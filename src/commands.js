require("discord-buttons")(client);
const { MessageButton, MessageActionRow } = require("discord-buttons");

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
        console.log("Loaded command " + (Object.keys(Commands).length + 1) + "/25")
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

exports.RequiredArg = RequiredArg
exports.Command = Command

Commands = {}

//text commands

Commands.help = new Command("Shows a list of all commands", (message, args) => {
    const CommandsEmbed = new Discord.MessageEmbed()
        .setColor("#0368f8")
        .setTitle("List of all commands:")
        .setTimestamp()
        .setFooter(Object.keys(Commands).length + " total commands")
    for (let key in Commands) {
        CommandsEmbed.addField(key, Commands[key].description, true)
    }
    let button = new MessageButton()
        .setStyle("url")
        .setURL("https://github.com/Felix-44/Xilef")
        .setLabel("Github page");
    message.channel.send(CommandsEmbed, button)
})

Commands.hi = new Command("Says hi to you", (message, args) => {
    message.reply("Hi.")
})

/*Commands.allutf8 = new Command("Get all existing characters in Discord", (message, args) => {
    if (message.author.id != "621307633718132746") {
        throw("You are NOT using this.")
    }
    let msg = ""
    for (let n = 0; n <= 0xFFFF; n++) {
        msg = msg + n + ": " + String.fromCharCode(n) + ", "
        if ((n % 50) == 0 && n > 0) {
            message.channel.send(msg)
            msg = ""
        }
    }
})*/

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

const chadimage = new Discord.MessageAttachment("./src/Pictures/giga chad.jpg")

Commands.chad = new Command("Sends a beautiful giga chad", (message, args) => {
    message.channel.send("epik")
    message.channel.send(chadimage)
})

const amogusimage = new Discord.MessageAttachment("./src/Pictures/amogus.gif")

Commands.amogus = new Command("It's pretty sus", (message, args) => {
    message.channel.send("sus")
    message.channel.send(amogusimage)
})

const sdrogoimage = new Discord.MessageAttachment("./src/Pictures/sdrogo.jpg")

Commands.sdrogo = new Command("Sdrogo man is da wae", (message, args) => {
    message.channel.send("hm yes")
    message.channel.send(sdrogoimage)
})

const vshitimage = new Discord.MessageAttachment("./src/Pictures/vshit.png")

Commands.vshit = new Command("Vsauce here", (message, args) => {
    message.channel.send("hey vsauce, Michael here, could you get out of my bathroom?")
    message.channel.send(vshitimage)
})

const uwuimage = new Discord.MessageAttachment("./src/Pictures/uwu.png")

Commands.uwu = new Command("Sends a super cute kawaii image ^w^", (message, args) => {
    message.channel.send(":3")
    message.channel.send(uwuimage)
})

const horseimages = [
    new Discord.MessageAttachment("./src/Pictures/Horse/horse1.jpg"),
    new Discord.MessageAttachment("./src/Pictures/Horse/horse2.jpg"),
    new Discord.MessageAttachment("./src/Pictures/Horse/horse3.jpg"),
    new Discord.MessageAttachment("./src/Pictures/Horse/horse4.jpg"),
    new Discord.MessageAttachment("./src/Pictures/Horse/horse5.jpg"),
]

Commands.horse = new Command("Sends a random horse photo, idk why I made this", (message, args) => {
    message.channel.send("have a horse I guess")
    let horse = Math.floor(Math.random() * 6)
    message.channel.send(horseimages[horse])
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

//economy commands

Commands.stats = new Command("Gets your amount of money and your rank", (message, args) => {
    let user = message.mentions.users.first() || message.author
    let EconomySystem = Economy.getEconomySystem(user)
    message.channel.send(new Discord.MessageEmbed()
        .setColor(message.member.displayHexColor)
        .setTitle(EconomySystem.user + "'s statistics")
        .setDescription("```lua\nDogeCoins: " + EconomySystem.money + "\nRank: " + EconomySystem.rank + "```")
        .addFields(
            { name: "Singleplayer stats:", value: "```lua\nImpostors found: " + EconomySystem.impostors + "\nDriller tier: " + EconomySystem.driller + "```", inline: true },
            { name: "Multiplayer stats:", value: "```lua\nReversi matches won: " + EconomySystem.reversi + "\nConnect four matches won: " + EconomySystem.connect4 + "```", inline: true },
        )
        .setTimestamp()
    )
})

Commands.daily = new Command("Get some free DogeCoins, works only once per day", (message, args) => {
    let day = new Date().getDate()
    let EconomySystem = Economy.getEconomySystem(message.author)
    if (day != EconomySystem.day) {
        EconomySystem.give(10 * EconomySystem.rank, message, true)
        EconomySystem.day = day
    } else {
        message.channel.send("Pretty sure you arleady got your reward today.")
    }
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
        if (chance > gamble + (5 + gamble / 100)) {
            message.channel.send("Oh wow you're lucky")
            EconomySystem.give(gamble, undefined, true)
            EconomySystem.give(gamble, message, true)
        } else {
            message.channel.send("Nope, you lost.")
        }
    }

}, [new RequiredArg(0, "You can't gamble air, choose an amount")])

Commands.leaderboard = new Command("See the users with the highest ranks", (message, args) => {
    const LeaderBoard = new Discord.MessageEmbed()
        .setColor("#0368f8")
        .setTitle("Top 10 users:")
        .setTimestamp()
    let leaderboard = Object.keys(Economy.list).sort((a, b) => { return Economy.list[b].rank - Economy.list[a].rank })
    let lbnum = 1
    for (let ID of leaderboard) {
        LeaderBoard.addField(lbnum + ": " + Economy.list[ID].user, "```lua\nRank: " + Economy.list[ID].rank + "\nDogeCoins: " + Economy.list[ID].money + "```", lbnum == 1 ? false : true)
        lbnum++
        if (lbnum > 10) { break }
    }
    message.channel.send(LeaderBoard)
})
