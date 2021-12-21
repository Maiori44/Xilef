const { Collection } = require('discord.js');
const { Event } = require('../event.js')

const runners = new Collection()

module.exports = new Event("messageCreate", async (client, message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(client.prefix)) return;
    if (runners.get(message.author.id) === true) return;
    if (!message.inGuild()) return;

    const args = message.content.substring(client.prefix.length).split(/ +/);

    let command = await client.commands.find(cmd => cmd.name == args[0]);

    if (!command) return message.reply(`${args[0]} is not a valid command!`);

    const permission = message.member.permissions.has(command.permission, true);

    if (!permission)
        return message.reply(
            `You do not have the permission \`${command.permission}\` to run this command!`
        );

    const possibleSubCommand = await command.subCommands.get(args[1])

    if (possibleSubCommand) {
        command = possibleSubCommand
        args.shift()
    }

    args.shift()

    // requiredarg handling
    if (command.requiredArgs) {
        const missingArgs = command.requiredArgs;

        command.requiredArgs.forEach(value => {
            if (args[value.argIndex])
                missingArgs.splice(missingArgs.indexOf(value), 1)
        })

        if (missingArgs.length != 0)
            return message.reply(`${missingArgs.map(arg => arg.errorMsg).join(', ')}`)
    }

    // command running

    runners.set(message.author.id, true)
    command.run(message, args, client)
        .then(() =>
            runners.set(message.author.id, false)
        )
});