
const Discord = require('discord.js')
const fs = require('fs');
const { inspect } = require('util');

class RequiredArg {
    constructor(argnum, errormsg, name, notrequired) {
        this.argnum = argnum
        this.errormsg = errormsg
        this.name = name
        this.notrequired = notrequired
    }

    check(args) {
        if (this.notrequired || args[this.argnum]) { return true }
        return false
    }
}

class Command {
    constructor(description, action, category, requiredargs, link) {
        this.description = description
        this.action = action
        this.category = category
        this.requiredargs = requiredargs
        this.link = link
        console.log("- " + Colors.green.colorize("Loaded command ") + Colors.hgreen.colorize((Object.keys(Commands).length + 1) + "/40"))
    }

    call(message, args) {
        if (this.category == "Developer") {
            const isdev = message.author.client.guilds.cache.get('875695405550166106')
                .members.cache.get(message.author.id)
                ?.roles.cache.has("875699796139208724")
            if (!isdev) {
                throw ("Only my developers can use this command")
            }
        }
        if (this.requiredargs)
            for (const arg of this.requiredargs)
                if (!arg.check(args)) throw { msg: arg.errormsg.replace(/\&/g, Prefix.get(message.guild.id)), name: arg.name, num: arg.argnum }

        this.action(message, args)
    }
}

exports.RequiredArg = RequiredArg
exports.Command = Command

const Buttons = new Discord.MessageActionRow()
Buttons.addComponents(new Discord.MessageButton()
    .setStyle("LINK")
    .setURL("https://github.com/Felix-44/Xilef")
    .setLabel("Github page"))
Buttons.addComponents(new Discord.MessageButton()
    .setStyle("LINK")
    .setURL("https://discord.gg/Qyz5HgrxWg")
    .setLabel("Official server"))
Buttons.addComponents(new Discord.MessageButton()
    .setStyle("LINK")
    .setURL("https://discord.com/api/oauth2/authorize?client_id=852882606629847050&permissions=275415091200&scope=bot")
    .setLabel("Invite bot"))

Commands = {}

//text commands

Commands.help = new Command("Shows a list of all commands or detailed info of a specific command, if given its name", (message, args) => {
    args[0] = args[0] ? args[0].toLowerCase() : undefined
    if (args[0] && Commands[args[0]]) {
        const CommandInfoEmbed = new Discord.MessageEmbed()
            .setColor("#0368f8")
            .setTitle(args[0])
            .setDescription(Commands[args[0]].description.replace(/\&/g, Prefix.get(message.guild.id)))
            .setTimestamp()
            .setFooter(Object.keys(Commands).length + " total commands")
        let syntax = `\`${Prefix.get(message.guild.id)}` + args[0]
        if (Commands[args[0]].requiredargs) {
            for (const arg of Commands[args[0]].requiredargs) {
                syntax = syntax + " " + (arg.notrequired ? "[" : "(") + arg.name + (arg.notrequired ? "]" : ")")
            }
        }
        syntax = syntax + "`"
        CommandInfoEmbed.addField("Syntax:", "arguments inside () are required, arguments inside [] can be omitted\narguments can have spaces using \" at the start and end of the argument\n" + syntax)
        let button
        if (Commands[args[0]].link) {
            button = new Discord.MessageButton()
                .setStyle("url")
                .setURL(Commands[args[0]].link)
                .setLabel(Commands[args[0]].category == "Game" ? "How to play" : "Github page")
        }
        message.channel.send({ embeds: [CommandInfoEmbed] }, button)
        return
    }
    const CommandsEmbed = new Discord.MessageEmbed()
        .setColor("#0368f8")
        .setTitle("List of all commands:")
        .setDescription(`You can do \`${Prefix.get(message.guild.id)}help (command name)\` to have a brief description of the command`)
        .setTimestamp()
        .setFooter(Object.keys(Commands).length + " total commands")
    let Categories = {}
    for (let key in Commands) {
        if (!Commands[key].category) continue
        if (!Categories[Commands[key].category]) {
            Categories[Commands[key].category] = []
        }
        Categories[Commands[key].category].push(key)
    }
    for (let category in Categories) {
        CommandsEmbed.addField(category + " commands", "`" + Categories[category].join("` `") + "`", true)
    }
    message.channel.send({ embeds: [CommandsEmbed] }, Buttons)
}, "Utility", [new RequiredArg(0, undefined, "command name", true)])

Commands.info = new Command("Shows info about the bot and this server's prefix", (message, args) => {
    message.channel.send({
        embeds: [
            new Discord.MessageEmbed()
                .setColor("#0368f8")
                .setTitle("Xilef info")
                .setDescription("Bot created by <@621307633718132746>\nYou can check out the code on github")
                .addField("This server's prefix:", "`" + Prefix.get(message.guild.id) + "`")
                .setTimestamp()
        ],
        components: [Buttons]
    })
}, "Utility")

//Joke commands

Commands.hi = new Command("Says hi to you", (message, args) => {
    message.reply("Hi.")
}, "Joke")

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
}) removed due to it obviously spamming, will not be re-enabled unless necessary*/

Commands.annoy = new Command("Annoys the person you want", (message, args) => {
    message.channel.send(args[0].slice(0, 1900) + " you suck")
}, "Joke", [new RequiredArg(0, "You gotta give me someone dumdum", "person")])

Commands.comfort = new Command("Comforts the person you want", (message, args) => {
    message.channel.send(args[0].slice(0, 1900) + " you don't suck")
}, "Joke", [new RequiredArg(0, "You gotta give me someone dumdum", "person")])

Commands.say = new Command("Says whatever you want", (message, args) => {
    if (!args.join(" ")) { args[0] = "** **" }
    message.channel.send(args.join(" ").slice(0, 1900))
    message.delete()
}, "Joke", [new RequiredArg(0, "I can't just say nothing, can I?", "...text")])

Commands.hentai = new Command("Totally sends you hentai", (message, args) => {
    message.channel.send("No..just no..")
}, "Joke")

Commands.secret = new Command("Sends you the secret of life", (message, args) => {
    message.author.send("The sercret of life is...\n" +
        "||⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣤⣤⣤⣤⣤⣶⣦⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀||\n" +
        "||⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⡿⠛⠉⠙⠛⠛⠛⠛⠻⢿⣿⣷⣤⡀⠀⠀⠀⠀⠀||\n" +
        "||⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⠋⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⠈⢻⣿⣿⡄⠀⠀⠀⠀||\n" +
        "||⠀⠀⠀⠀⠀⠀⠀⣸⣿⡏⠀⠀⠀⣠⣶⣾⣿⣿⣿⠿⠿⠿⢿⣿⣿⣿⣄⠀⠀⠀||\n" +
        "||⠀⠀⠀⠀⠀⠀⠀⣿⣿⠁⠀⠀⢰⣿⣿⣯⠁⠀⠀⠀⠀⠀⠀⠀⠈⠙⢿⣷⡄⠀||\n" +
        "||⠀⠀⣀⣤⣴⣶⣶⣿⡟⠀⠀⠀⢸⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣷⠀||\n" +
        "||⠀⢰⣿⡟⠋⠉⣹⣿⡇⠀⠀⠀⠘⣿⣿⣿⣿⣷⣦⣤⣤⣤⣶⣶⣶⣶⣿⣿⣿⠀||\n" +
        "||⠀⢸⣿⡇⠀⠀⣿⣿⡇⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠃⠀||\n" +
        "||⠀⣸⣿⡇⠀⠀⣿⣿⡇⠀⠀⠀⠀⠀⠉⠻⠿⣿⣿⣿⣿⡿⠿⠿⠛⢻⣿⡇⠀⠀||\n" +
        "||⠀⣿⣿⠁⠀⠀⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣧⠀⠀||\n" +
        "||⠀⣿⣿⠀⠀⠀⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⠀⠀||\n" +
        "||⠀⣿⣿⠀⠀⠀⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⠀⠀||\n" +
        "||⠀⢿⣿⡆⠀⠀⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⡇⠀⠀||\n" +
        "||⠀⠸⣿⣧⡀⠀⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⠃⠀⠀||\n" +
        "||⠀⠀⠛⢿⣿⣿⣿⣿⣇⠀⠀⠀⠀⠀⣰⣿⣿⣷⣶⣶⣶⣶⠶⠀⢠⣿⣿⠀⠀⠀||\n" +
        "||⠀⠀⠀⠀⠀⠀⠀⣿⣿⠀⠀⠀⠀⠀⣿⣿⡇⠀⣽⣿⡏⠁⠀⠀⢸⣿⡇⠀⠀⠀||\n" +
        "||⠀⠀⠀⠀⠀⠀⠀⣿⣿⠀⠀⠀⠀⠀⣿⣿⡇⠀⢹⣿⡆⠀⠀⠀⣸⣿⠇⠀⠀⠀||\n" +
        "||⠀⠀⠀⠀⠀⠀⠀⢿⣿⣦⣄⣀⣠⣴⣿⣿⠁⠀⠈⠻⣿⣿⣿⣿⡿⠏⠀⠀⠀⠀||\n" +
        "||⠀⠀⠀⠀⠀⠀⠀⠈⠛⠻⠿⠿⠿⠿⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀||\n" +
        "|| amogus. ||")
}, "Joke")

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
}, "Math")

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
        case 99:
            message.channel.send("Wow, " + name + " is not a clown, " + name + " is the entire circus")
            break
    }
}, "Math", [new RequiredArg(0, "You're a clown at 100%, since you didn't even give me something or someone", "something")])

const { evaluate } = require('./developer');

Commands.eval = new Command("Evaluates the given args as JavaScript code, and returns the output", (message, args) => {
    try {
        const EVAL = {
            AVAILABLE_MODULES: [
                'buffer', 'path',
                'stream', 'string_decoder',
                'url', 'util'
            ]
        };

        const code = message.content.match(/```(?:js|javascript)\n([^]*)\n```/i)?.[1]
            ?? args.join(" ")

        const output = evaluate(code, {
            EVAL, console: undefined // set to undefined because the
                                     // default one doesnt even work
        }, {
            stdlibs: EVAL.AVAILABLE_MODULES,
            timeout: 2000
        });
        message.channel.send({
            embeds: [
                new Discord.MessageEmbed()
                    .setColor("#0368f8")
                    .setTitle("Output")
                    .setDescription("```js\n" +
                        (typeof output === 'string' ? output : inspect(output))
                    + "\n```")
                    .setTimestamp()
            ]
        })
    } catch (error) {
        message.channel.send({
            embeds: [
                new Discord.MessageEmbed()
                    .setColor("#FF0000")
                    .setTitle("An error occured:")
                    .setDescription(`${error.name}: ${error.message}`)
                    .setTimestamp()
            ]
        })
    }
}, "Math", [new RequiredArg(0, "You have to evalute *something*", "...code")])

//images commands

const chadimage = new Discord.MessageAttachment("./src/Pictures/giga chad.jpg")

Commands.chad = new Command("Sends a beautiful giga chad", (message, args) => {
    message.channel.send("epik")
    message.channel.send({ files: [chadimage] })
}, "Images")

const amogusimage = new Discord.MessageAttachment("./src/Pictures/amogus.gif")

Commands.amogus = new Command("It's pretty sus", (message, args) => {
    message.channel.send("sus")
    message.channel.send({ files: [amogusimage] })
}, "Images")

const sdrogoimage = new Discord.MessageAttachment("./src/Pictures/sdrogo.jpg")

Commands.sdrogo = new Command("Sdrogo man is da wae", (message, args) => {
    message.channel.send("hm yes")
    message.channel.send({ files: [sdrogoimage] })
}, "Images")

const vshitimage = new Discord.MessageAttachment("./src/Pictures/vshit.png")

Commands.vshit = new Command("Vsauce here", (message, args) => {
    message.channel.send("hey vsauce, Michael here, could you get out of my bathroom?")
    message.channel.send({ files: [vshitimage] })
}, "Images")

const uwuimage = new Discord.MessageAttachment("./src/Pictures/uwu.png")

Commands.uwu = new Command("Sends a super cute kawaii image ^w^", (message, args) => {
    message.channel.send(":3")
    message.channel.send({ files: [uwuimage] })
}, "Images")

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
    message.channel.send({ files: [horseimages[horse]] })
}, "Images")

Commands.whoasked = new Command("Finds out the person who asked", (message, args) => {
    message.channel.send("https://tenor.com/view/meme-who-asked-satellite-looking-radar-gif-17171784")
    message.channel.send("Asking neighbours if they know who asked...")
    setTimeout(() => { message.channel.send("Asking the government if they know who asked...") }, 3000)
    setTimeout(() => { message.channel.send("Asking the aliens if they know who asked...") }, 6000)
    setTimeout(() => { message.channel.send("Asking god if they know who asked...") }, 9000)
    setTimeout(() => { message.channel.send("Asking google if they know who asked...") }, 12000)
    setTimeout(() => { message.channel.send("Yeah no, nobody asked.") }, 15000)
}, "Images")

//economy commands

Commands.stats = new Command("Shows a list of all your stats, like your money or rank\nyou can get other people's stats by pinging them", (message, args) => {
    let user = message.mentions.users.first() || message.author
    let EconomySystem = Economy.getEconomySystem(user)
    message.channel.send({
        embeds: [
            new Discord.MessageEmbed()
                .setColor(message.member.displayHexColor)
                .setTitle(EconomySystem.user + "'s v_s")
                .setDescription(EconomySystem.vgot.getBinary(v_Types.binary, "❔"))
                .setTimestamp(),
            new Discord.MessageEmbed()
                .setColor(message.member.displayHexColor)
                .setTitle(EconomySystem.user + "'s statistics")
                .setDescription("```lua\nDogeCoins: " + EconomySystem.money +
                    "\nRank: " + EconomySystem.rank +
                    "\nXilefunds: " + EconomySystem.xilefunds + "```")
                .addFields(
                    {
                        name: "Singleplayer stats:", value:
                            "```js\nImpostors found: " + EconomySystem.impostors +
                            "\nDriller tier: " + EconomySystem.driller +
                            "\nDungeon top floor: " + EconomySystem.floor +
                            "\nMineSweeper matches won: " + EconomySystem.msweeper + "```", inline: true
                    },
                    {
                        name: "Multiplayer stats:", value:
                            "```lua\nReversi matches won: " + EconomySystem.reversi +
                            "\nConnect four matches won: " + EconomySystem.connect4 +
                            "\nRoshambo matches won: " + EconomySystem.roshambo + "```", inline: true
                    },
                    { name: "Achievements:", value: EconomySystem.achievments.getBinary(Achievements.binary, "❔ ???\n") }
                ),
        ]
    })
}, "Economy", [new RequiredArg(0, undefined, "@person", true)])

Commands.daily = new Command("Get some free DogeCoins, works only once per day", (message, args) => {
    let day = Date.now()
    let EconomySystem = Economy.getEconomySystem(message.author)
    let diff = day - EconomySystem.day
    if (diff >= Time.day) {
        EconomySystem.give(10 * EconomySystem.rank, message, true)
        EconomySystem.day = day
    } else {
        message.channel.send("Pretty sure you already got your reward today\nyou can get a new reward in " + Time.convertTime(Time.day - diff))
    }
}, "Economy")

Commands.rankup = new Command("Increases your rank if you have enough money\nthe rank can be increased multiple times if given an amount of times\n\nIf the rank number starts with '=', instead of adding the current rank with `amount`, your rank will be exactly `amount`.", (message, args) => {
    let EconomySystem = Economy.getEconomySystem(message.author)
    let oldrank = EconomySystem.rank

    if (args[0]?.startsWith('=') && ((parseInt(args[0].slice(1)) || 1) <= oldrank))
        return void message.channel.send(`The rank must be above ${oldrank}!`)

    let times = args[0]?.startsWith('=')
        ? parseInt(args[0].slice(1)) - oldrank || 0
        : parseInt(args[0]) || 1
    for (let i = 1; i <= times; i++) {
        let needed = 100 * EconomySystem.rank
        if (EconomySystem.buy(needed, message, undefined, EconomySystem.user + " needs " + (needed - EconomySystem.money) + " more DogeCoins for rank " + (EconomySystem.rank + 1), true)) {
            EconomySystem.alterValue("rank", 1, 1000000000)
        } else break
    }
    if (oldrank != EconomySystem.rank) {
        message.channel.send(EconomySystem.user + " is now rank " + EconomySystem.rank + "!")
    }
}, "Economy", [new RequiredArg(0, undefined, "amount", true)])

Commands.gamble = new Command("Gamble your money away cause you have a terrible life", (message, args) => {
    let gamble = parseInt(args[0])
    if (isNaN(gamble)) {
        throw ("That is definitively not a number")
    } else if (gamble <= 5) {
        throw ("That number is a bit too low.")
    }
    let EconomySystem = Economy.getEconomySystem(message.author)
    if (EconomySystem.buy(gamble, message, null, "You don't have enough DogeCoins to gamble " + gamble, true)) {
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
}, "Economy", [new RequiredArg(0, "You can't gamble air, choose an amount", "amount")])

Commands.leaderboard = new Command("See the users with the highest ranks", (message, args) => {
    const LeaderBoard = new Discord.MessageEmbed()
        .setColor("#0368f8")
        .setTitle("Top 10 users:")
        .setTimestamp()
    let leaderboard = Object.keys(Economy.list).sort((a, b) => { return Economy.list[b].rank - Economy.list[a].rank })
    let lbnum = 1
    for (let ID of leaderboard) {
        if (lbnum == 1) {
            Economy.list[ID].award("first", message)
        }
        LeaderBoard.addField(lbnum + ": " + Economy.list[ID].user, "```lua\nRank: " + Economy.list[ID].rank + "\nDogeCoins: " + Economy.list[ID].money + "```", lbnum == 1 ? false : true)
        lbnum++
        if (lbnum > 10) { break }
    }
    message.channel.send({ embeds: [LeaderBoard] })
}, "Economy")

require("./xilefunds")