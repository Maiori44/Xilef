const { Collection } = require('discord.js');
const { Event } = require('../event.js')

const runners = new Collection()

module.exports = new Event("messageCreate", async (client, message) => {
    if (message.author.bot) return;

    if (!message.content.startsWith(client.prefix)) return;

    const args = message.content.substring(client.prefix.length).split(/ +/);

    const command = await client.commands.find(cmd => cmd.name == args[0]);

    if (!command) return message.reply(`${args[0]} is not a valid command!`);

    const permission = await message.member.permissions.has(command.permission, true);

    if (!permission)
        return message.reply(
            `You do not have the permission \`${command.permission}\` to run this command!`
        );

    args.shift()

    if (runners.get(message.author.id) === true) return

    runners.set(message.author.id, true)
    command.run(message, args, client)
        .then(() =>
            runners.set(message.author.id, false)
        )
});