require("discord-buttons")(client);
const { MessageButton, MessageActionRow } = require("discord-buttons");
const { RequiredArg, Command } = require("./commands.js")

class Poll {
    constructor(message, options) {
        this.message = message
        this.options = options
        this.users = {}
    }

    update() {
        let newmsg = new Discord.MessageEmbed()
        .setColor(this.message.member.displayHexColor)
        .setTitle(this.message.author.username + "'s poll")
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
        this.message.edit(newmsg)
    }
}

Polls = {}

Commands.poll = new Command("WIP", (message, args) => {
    if (args[5]) {
        throw ("You can only have 5 different options at max.")
    }
    let options = {}
    let buttons = new MessageActionRow()
    for (let buttonname of args) {
        options[buttonname] = 0
        let button = new MessageButton()
            .setStyle("blurple")
            .setLabel(buttonname)
            .setID(message.id + "-" + buttonname);
        buttons.addComponent(button)
    }
    message.channel.send("Creating poll...", buttons).then(pollmessage => {
        Polls[message.id] = new Poll(pollmessage, options)
        Polls[message.id].update()
    })
}, [new RequiredArg(0, "You need at least 1 option for a poll.")])

client.on('clickButton', async (button) => {
    let split = button.id.split("-") 
    let buttonid = split[0]
    let buttonname = split.slice(1).join('-')
    if (Polls[buttonid]) {
        let options = Polls[buttonid].options
        if (options[buttonname] != undefined) {
            options[buttonname] = options[buttonname] + 1
            if (Polls[buttonid].users[button.clicker.id] && options[Polls[buttonid].users[button.clicker.id]]) {
                options[Polls[buttonid].users[button.clicker.id]] = options[Polls[buttonid].users[button.clicker.id]] - 1
            }
            if (Polls[buttonid].users[button.clicker.id] == buttonname) {
                options[Polls[buttonid].users[button.clicker.id]] = options[Polls[buttonid].users[button.clicker.id]] - 1
                Polls[buttonid].users[button.clicker.id] = undefined
            } else {
                Polls[buttonid].users[button.clicker.id] = buttonname
            }
            Polls[buttonid].update()
            await button.reply.send("Your choice was submitted sucessfully.", true)
        } else {
            await button.reply.send("Somehow, that isn't one of the poll's option.", true)
        }
    } else {
        await button.reply.send("This poll is closed.", true)
    }
});