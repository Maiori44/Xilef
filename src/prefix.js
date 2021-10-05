const { RequiredArg, Command } = require("./commands.js")
const fs = require('fs')
const { Console } = require("console")

Prefix = {
	/**
	 * @param {string} guildID
	 * @returns {string} - The guild's prefix. fallbacks to the global prefix (client.prefix)
	 */
	get(guildID) {
		return debugmode ? "beta&" : (this.read()[guildID] ?? client.prefix)
	},

	/**
	 * Gets the whole prefixes.json
	 * @returns {{[string in string]: string}}
	 */
	read() {
		return JSON.parse(fs.readFileSync("./src/Data/prefixes.json", "utf8"))
	}
}

Commands.prefix = new Command('Changes the prefix for the current server. Put `default` as the argument of `prefix` to reset the current server-prefix to the global prefix\nThe user needs \"Manage Guild\" permissions for this command', (message, args) => {
	if (debugmode) {
		console.log("- " + Colors.blue.colorize("Aborted server prefix update:") +
			"\n\tCurrent prefix: " + Prefix.get(message.guild.id) +
			"\n\tRequested prefix: " + args[0] +
			"\n\tReason: Debug mode is active" +
			"\n\tGuild name: " + message.guild.name +
			"\n\tGuild ID: " + message.guild.id)
		console.log("- " + Colors.blue.colorize("Update of ") + Colors.hblue.colorize("prefixes.json") + Colors.blue.colorize(" was cancelled due to debug mode being active"))
		throw ("This command cannot be used while in debug mode")
	}
	if (!message.member.permissions.has("MANAGE_GUILD")) {
		console.log("- " + Colors.blue.colorize("Aborted server prefix update:") +
			"\n\tCurrent prefix: " + Prefix.get(message.guild.id) +
			"\n\tRequested prefix: " + args[0] +
			"\n\tReason: The user does not have \"Manage Guild\" permissions" +
			"\n\tGuild name: " + message.guild.name +
			"\n\tGuild ID: " + message.guild.id)
		console.log("- " + Colors.blue.colorize("Update of ") + Colors.hblue.colorize("prefixes.json") + Colors.blue.colorize(" was cancelled due to the user not having \"Manage Guild\" permissions"))
		throw ("You need \"Manage Guild\" permissions for this command")
	}
	console.log("- " + Colors.cyan.colorize("Successfully updated server prefix:") +
		"\n\tOld prefix: " + Prefix.get(message.guild.id) +
		"\n\tNew prefix: " + args[0] +
		"\n\tGuild name: " + message.guild.name +
		"\n\tGuild ID: " + message.guild.id)
	fs.writeFileSync(
		"./src/Data/prefixes.json",
		JSON.stringify(
			{
				...Prefix.read(),
				[message.guild.id]: args[0] == 'default' ? undefined : args[0]
			}, null, 4
		),
		"utf8"
	)
	message.channel.send("This server's prefix is now `" + Prefix.get(message.guild.id) + "`")
	console.log("- " + Colors.purple.colorize("Successfully updated file ") + Colors.hpurple.colorize("prefixes.json"))
}, 'Utility', [new RequiredArg(0, 'Missing `prefix` argument', 'prefix')])
