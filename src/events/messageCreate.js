const { Collection, MessageEmbed } = require('discord.js');
const { Event } = require('../event.js')
const { eventLogger, economyLogger } = require('../constants.js');

const runners = new Collection()

module.exports = new Event("messageCreate", async (client, message) => {
    // checks
    if (message.author.bot) return;
    if (!message.content.startsWith(client.prefix)) return;
    if (runners.get(message.author.id) === true) return;
    if (!message.inGuild()) return;

    // basic command fetching
    const args = message.content.substring(client.prefix.length).split(/ +/);

    let command = await client.commands.get(args[0]);
    if (!command) return message.reply(`${args[0]} is not a valid command!`);

    args.shift()

    let oldCommand

    // subcommand handling
    if (command.subCommands) {
        const possibleSubCommand = await command.subCommands.find(subcmd => subcmd.name == args[0])

        if (possibleSubCommand) {
            oldCommand = command
            command = possibleSubCommand

            args.shift()
        }
    }

    // permission handling
    const permission = message.member.permissions.has(command.permission, true);
    if (!permission)
        return message.reply(
            `You do not have the permission \`${command.permission}\` to run this command!`
        );

    // requiredarg handling
    if (command.requiredArgs && command.requiredArgs.length != 0) {
        let missingArgs = [...command.requiredArgs]
        let indexesToSplice = []

        for (let i = 0; i < command.requiredArgs.length; i++) {
            let requiredArg = command.requiredArgs[i]

            if (
                !requiredArg.validValues            
                || requiredArg.validValues.length == 0 // validValues exists or it isn't an empty array
            )
                indexesToSplice.push(i)
            else if (
                args[requiredArg.argIndex]                                      // there's an argument at the pos it's needed
                && requiredArg.validValues.includes(args[requiredArg.argIndex]) // validValues possesses that argument
            )
                indexesToSplice.push(i)
            
            
        }

        indexesToSplice.forEach(index => {
            missingArgs.splice(index, 1)
        })

        if (missingArgs.length != 0) {
            return message.reply({
                embeds: [
                    new MessageEmbed() 
                        .setColor(message.member.displayHexColor)
                        .setTimestamp()
                        .setFooter(missingArgs.length + " missing arguments.")
                        .setTitle(`Missing / unmatched required argument \`${missingArgs[0].argName}\``)
                        .setDescription(`__Error message__ : ${missingArgs[0].errorMsg}\n__Valid values__ : ${missingArgs[0].validValues.join(', ')}` )
                ]
            })
        }
    }

    // command execution
    runners.set(message.author.id, true)
    eventLogger.debug(`executing command %s for user %s in %s/#%s`, command.name, message.author.tag, message.channel.guild.name + "/#", message.channel.name)
    command.run(message, args, client)
        .then(() => {
            runners.set(message.author.id, false)
            eventLogger.info("successfully executed command %s for %s (%s) in %s/%s", command.name, message.author.id, message.author.tag, message.channel.guild.name, '#' + message.channel.name)
        })
        .catch((err) => {
            const errMsg = "Failed to execute command! (" + err + ")"
            message.reply(errMsg)
            eventLogger.error(errMsg)
        })
});