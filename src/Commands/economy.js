const { Commands, Command, RequiredArg } = require('../commands.js');


Commands.stats = new Command("Shows a list of all your stats, like your money or rank\nyou can get other people's stats by pinging them", (message, args) => {
    let user = message.mentions.users.first() || message.author
    let EconomySystem = Economy.getEconomySystem(user)
    message.channel.send({
        embeds: [
            new MessageEmbed()
                .setColor(message.member.displayHexColor)
                .setTitle(EconomySystem.user + "'s statistics")
                .setDescription("```lua\nDogeCoins: " + EconomySystem.money +
                    "\nRank: " + EconomySystem.rank +
                    "\nXilefunds: " + EconomySystem.xilefunds + "```")
                .addFields(
                    {
                        name: "Singleplayer stats:",
                        value:
                            "```js\nImpostors found: " + EconomySystem.impostors +
                            "\nDriller tier: " + EconomySystem.driller +
                            "\nDungeon top floor: " + EconomySystem.floor +
                            "\nMineSweeper matches won: " + EconomySystem.msweeper + "```",
                        inline: true
                    },
                    {
                        name: "Multiplayer stats:",
                        value:
                            "```lua\nReversi matches won: " + EconomySystem.reversi +
                            "\nConnect four matches won: " + EconomySystem.connect4 +
                            "\nRoshambo matches won: " + EconomySystem.roshambo + "```",
                        inline: true
                    },
                    {
                        name: "Achievements:",
                        value: EconomySystem.achievments.getBinary(Achievements.binary, "❔ ???\n")
                    }
                ),

            new MessageEmbed()
                .setColor(message.member.displayHexColor)
                .setTitle(EconomySystem.user + "'s v_s")
                .setDescription(EconomySystem.vgot.getBinary(v_Types.binary, "❔"))
                .setTimestamp(),
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
    const LeaderBoard = new MessageEmbed()
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

require("../xilefunds.js")