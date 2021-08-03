require("discord-buttons")(client);
const { MessageButton, MessageActionRow } = require("discord-buttons");
const { RequiredArg, Command } = require("./commands.js")

class Poll {
    constructor(message, options) {
        this.message = message
        this.options = options
    }

    update() {
        let newmsg = ""
        for (let buttonname of Object.keys(this.options)) {
            newmsg = newmsg + buttonname + ": " + this.options[buttonname] + "\n"
        }
        this.message.edit(newmsg)
    }
}

Polls = {}

Commands.test = new Command("This is a test", (message, args) => {
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
    let [buttonid, buttonname] = button.id.split("-")
    if (Polls[buttonid]) {
        let options = Polls[buttonid].options
        if (options[buttonname] != undefined) {
            options[buttonname] = options[buttonname] + 1
            Polls[buttonid].update()
            await button.reply.send("Your choice was submitted sucessfully.", true)
        } else {
            await button.reply.send("Somehow, that isn't one of the poll's option.", true)
        }
    } else {
        await button.reply.send("This poll is closed.", true)
    }
});