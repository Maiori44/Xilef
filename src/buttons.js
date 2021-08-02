require("discord-buttons")(client);
const { MessageButton, MessageActionRow } = require("discord-buttons");
const { RequiredArg, Command } = require("./commands.js")

Polls = {}

Commands.test = new Command("This is a test", (message, args) => {
    let button = new MessageButton()
    .setStyle("blurple")
    .setLabel(args[0] || "unnamed")
    .setID(message.id);

    Polls[message.id] = 0

    message.channel.send(message.id, button)
})

client.on('clickButton', async (button) => {
    if (Polls[button.id] != undefined) {
        Polls[button.id] = Polls[button.id] + 1
        await button.reply.send(Polls[button.id])
    } else {
        await button.reply.send("This poll is closed.", true)
    }
});