const { MessageButton, MessageActionRow, MessageMenuOption, MessageMenu } = require("discord-buttons")
const { RequiredArg, Command } = require("./commands.js")

class Poll {
    constructor(message, options, title, time) {
        this.message = message
        this.options = options
        this.users = {}
        this.title = title || "Unnamed Poll"
        this.time = time
    }

    update() {
        let newmsg = new Discord.MessageEmbed()
            .setColor(this.message.member.displayHexColor)
            .setTitle(this.title)
            .setFooter("Expires after " + this.time + " minutes")
            .setTimestamp();
        let voters = "People who voted:\n"
        for (let userid of Object.keys(this.users)) {
            if (this.users[userid]) {
                voters = voters + "<@" + userid + "> "
            }
        }
        if (voters == "People who voted:\n") {
            voters = voters + "`none`"
        }
        newmsg.setDescription(voters)
        for (let buttonname of Object.keys(this.options)) {
            newmsg.addField(buttonname, this.options[buttonname], true)
        }
        this.message.edit("", newmsg)
    }
}

Polls = {}

Commands.poll = new Command("Creates a poll where anyone can vote, you can have 5 different options at max\n a simple yes/no poll can be created by omitting some/all arguments", (message, args) => {
    if (args[7]) {
        throw ("You can only have 5 different options at max.")
    }
    let options = {}
    let buttons = new MessageActionRow()
    let argnum = -1
    for (let buttonname of args) {
        argnum = argnum + 1
        if (argnum < 2) continue
        options[buttonname] = 0
        let button = new MessageButton()
            .setStyle("blurple")
            .setLabel(buttonname)
            .setID("poll-" + message.id + "-" + buttonname);
        buttons.addComponent(button)
    }
    if (args.length == 0 || !args[2]) {
        buttons.addComponent(new MessageButton()
            .setStyle("green")
            .setLabel("Yes")
            .setID("poll-" + message.id + "-Yes"))
        buttons.addComponent(new MessageButton()
            .setStyle("red")
            .setLabel("No")
            .setID("poll-" + message.id + "-No"))
        options["Yes"] = 0
        options["No"] = 0
    }
    message.channel.send("Creating poll...", buttons).then(pollmessage => {
        const time = Math.min(parseFloat(args[1]) * 60 * 1000 || 300000, 0x7FFFFFFF)
        Polls[message.id] = new Poll(pollmessage, options, args[0] || message.author.username + "'s poll", time / 1000 / 60)
        Polls[message.id].update()
        console.log("- " + Colors.cyan.colorize("Sucessfully created a poll:") +
            "\n\tCreator: " + message.author.username +
            "\n\tPoll title: " + Polls[message.id].title +
            "\n\tPoll duration: " + Polls[message.id].time + " minutes" +
            "\n\tPoll options: " + Object.keys(Polls[message.id].options))
        setTimeout(() => {
            pollmessage.edit("[This poll is closed.]", pollmessage.embeds)
            console.log("- " + Colors.cyan.colorize("Sucessfully closed a poll:") +
                "\n\tCreator: " + message.author.username +
                "\n\tPoll title: " + Polls[message.id].title +
                "\n\tPoll options: " + JSON.stringify(Polls[message.id].options) +
                "\n\tPoll voters: " + JSON.stringify(Polls[message.id].users))
            Polls[message.id] = undefined
        }, time)
    })
}, "Utility", [new RequiredArg(0, undefined, "title", true), new RequiredArg(1, undefined, "duration", true), new RequiredArg(2, undefined, "option 1", true), new RequiredArg(3, undefined, "option 2", true), new RequiredArg(4, undefined, "option 3", true), new RequiredArg(5, undefined, "option 4", true), new RequiredArg(6, undefined, "option 5", true)])

ButtonEvents = {
    poll: async (button, id, optionname) => {
        if (Polls[id]) {
            let options = Polls[id].options
            if (options[optionname] != undefined) {
                await button.reply.defer()
                options[optionname] = options[optionname] + 1
                if (Polls[id].users[button.clicker.id] && options[Polls[id].users[button.clicker.id]]) {
                    options[Polls[id].users[button.clicker.id]] = options[Polls[id].users[button.clicker.id]] - 1
                }
                if (Polls[id].users[button.clicker.id] == optionname) {
                    options[Polls[id].users[button.clicker.id]] = options[Polls[id].users[button.clicker.id]] - 1
                    Polls[id].users[button.clicker.id] = undefined
                } else {
                    Polls[id].users[button.clicker.id] = optionname
                }
                console.log("- " + Colors.cyan.colorize("Sucesfully voted in a poll:") +
                    "\n\tVoter name: " + button.clicker.user.useroptionname +
                    "\n\tVoter ID: " + button.clicker.id +
                    "\n\tVoted option name: " + optionname +
                    "\n\tPoll ID: " + id +
                    "\n\tPoll title: " + Polls[id].title +
                    "\n\tPoll options: " + JSON.stringify(Polls[id].options) +
                    "\n\tPoll voters: " + JSON.stringify(Polls[id].users))
                Polls[id].update()
            } else {
                console.log("- " + Colors.yellow.colorize("Failed attempt at voting in a poll, the selected option doesn't exist:") +
                    "\n\tVoter name: " + button.clicker.user.useroptionname +
                    "\n\tVoter ID: " + button.clicker.id +
                    "\n\tPoll ID: " + id +
                    "\n\tPoll title: " + Polls[id].title +
                    "\n\tRequested option name: " + optionname +
                    "\n\tPoll options: " + JSON.stringify(Polls[id].options) +
                    "\n\tPoll voters: " + JSON.stringify(Polls[id].users))
                await button.reply.send("Somehow, that isn't one of the poll's option.", true)
            }
        } else {
            console.log("- " + Colors.blue.colorize("Failed attempt at voting in a poll, the poll is closed/does not exist:") +
                "\n\tRequested Poll ID: " + id +
                "\n\tOption name: " + optionname)
            await button.reply.send("This poll is closed.", true)
        }
    }
}

client.on('clickButton', async (button) => {
    const buttonargs = button.id.split("-")
    const event = buttonargs[0]
    if (ButtonEvents[event]) ButtonEvents[event](button, buttonargs[1], buttonargs.slice(2).join('-'))
    else throw ("unknown button event received\n\tButton event name: " + event)
})