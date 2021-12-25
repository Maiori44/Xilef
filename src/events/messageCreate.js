const { Collection, MessageEmbed } = require('discord.js');
const { Event } = require('../event.js')
const { eventLogger } = require('../constants.js');

const runners = new Collection()

module.exports = new Event("messageCreate", async (client, message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(client.prefix)) return;
    if (runners.get(message.author.id) === true) return;
    if (!message.inGuild()) return;

    const args = message.content.substring(client.prefix.length).split(/ +/);

    let command = await client.commands.get(args[0]);

    if (!command) return message.reply(`${args[0]} is not a valid command!`);

    const permission = message.member.permissions.has(command.permission, true);

    const possibleSubCommand = await command.subCommands.find(subcmd => subcmd.name == args[1])

    if (possibleSubCommand) {
        command = possibleSubCommand
        args.shift()
    }

    args.shift()

    if (!permission)
        return message.reply(
            `You do not have the permission \`${command.permission}\` to run this command!`
        );

    // requiredarg handling
    if (command.requiredArgs) {
        let missingArgs = [...command.requiredArgs]
        command.requiredArgs.forEach(requiredArg => {
            if (requiredArg.validValues.includes(args[requiredArg.argIndex])) {
                missingArgs.splice(missingArgs.indexOf(requiredArg), 1)
            }
        })

        if (missingArgs.length != 0) {
            const missingArgEmbed = new MessageEmbed()
                .setColor(message.member.displayColor)
                .setTitle("Unmatched required argument : " + missingArgs[0].argName)
                .setDescription(" \nError message : `" + missingArgs[0].errorMsg + "`")
                .setTimestamp()

            return message.reply({ embeds: [missingArgEmbed] })
        }
    }

    // command running

    runners.set(message.author.id, true)
    eventLogger.debug(`executing command ${command.name} for user ${message.author.tag} in ${message.channel.name}`)
    command.run(message, args, client)
        .then(() => {
            runners.set(message.author.id, false)
            eventLogger.info("successfully executed command %s for %s (%s) in %s", command.name, message.author.id, message.author.tag, message.channel.name)
        })
        .catch((err) => {
            const errMsg = "Failed to execute command! (" + err + ")"
            message.reply(errMsg)
            eventLogger.error(errMsg)
        })
});