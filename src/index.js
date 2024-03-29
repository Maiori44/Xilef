require("dotenv").config()
Discord = require('discord.js')

debugmode = process.argv[2] == "-debug" ? true : false

client = new Discord.Client({
	intents: [
		Discord.Intents.FLAGS.GUILDS,
		Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
		Discord.Intents.FLAGS.GUILD_MESSAGES,
		Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Discord.Intents.FLAGS.GUILD_PRESENCES
	]
})
client.login(debugmode ? process.env.DEBUG : process.env.TOKEN)
client.prefix = debugmode ? "beta&" : "&"

Time = {
	day: 86400000,
	hour: 3600000,
	minute: 60000,
	second: 1000,
	convertTime(time) {
		if (time < Time.second) return time + " milliseconds"
		else if (time < Time.minute) return (Math.floor(time / Time.second)) + " seconds"
		else if (time < Time.hour) return (Math.floor(time / Time.minute)) + " minutes"
		else if (time < Time.day) return (Math.floor(time / Time.hour)) + " hours"
		else return (Math.floor(time / Time.day)) + " days"
	}
}

class Colorizer {
	constructor(color) {
		this.color = color
	}

	colorize(text) {
		return this.color + text + Colors.reset.color
	}
}

Colors = {
	reset: new Colorizer("\033[0m"),
	white: new Colorizer("\033[97m"),
	green: new Colorizer("\033[92m"),
	red: new Colorizer("\033[31m"),
	blue: new Colorizer("\033[34m"),
	yellow: new Colorizer("\033[33m"),
	purple: new Colorizer("\033[35m"),
	cyan: new Colorizer("\033[36m"),
	hblack: new Colorizer("\033[40m\033[97m"),
	hred: new Colorizer("\033[41m\033[97m"),
	hgreen: new Colorizer("\033[42m\033[97m"),
	hyellow: new Colorizer("\033[43m\033[97m"),
	hblue: new Colorizer("\033[44m\033[97m"),
	hpurple: new Colorizer("\033[45m\033[97m"),
	hcyan: new Colorizer("\033[46m\033[97m"),
}

GetPercentual = () => {
	return Math.floor(Math.random() * 101)
}

warning = debugmode ? "This bot is running in debug mode, no changes will be saved" : undefined

require("./economy.js")
require("./commands.js")
require("./parsers.js")
require("./buttons.js")
require("./minigames.js")
require('./developer')

function handler(message, content, prefix) {
	let start = Date.now()
	let args = [...content.matchAll(/"([^"]*?)"|[^ ]+/gm)].map(el => el[1] || el[0] || "")
	let command = args.shift()
	const rawCommand = command;
	command = command ? command.toLowerCase() : undefined
	if (command == "") {
		message.channel.send('Wow great command, " ", makes complete sense');
		return;
	} else if (Commands[command]) {
		try {
			Commands[command.toLowerCase()].call(message, args);
			if (!debugmode) {
				Economy.save();
			} else console.log("- " + Colors.blue.colorize("Update of ") + Colors.hblue.colorize("economy.json") + Colors.blue.colorize(" was cancelled due to debug mode being active"));
			if (warning) {
				message.channel.send({
					embeds: [
						new Discord.MessageEmbed()
							.setColor("#ff0000")
							.setTitle("Warning")
							.setDescription(warning)
							.setTimestamp()
					]
				});
			}
			console.log("- " + Colors.green.colorize("Command call completed sucessfully:") +
				"\n\tCommand: " + command +
				"\n\tArgs: " + args +
				"\n\tTime taken: " + (Date.now() - start) +
				"\n\tCalled at: " + new Date() +
				"\n\tCaller: " + message.author.username +
				"\n\tChannel name: " + message.channel.name +
				"\n\tGuild name: " + message.guild.name);
		} catch (errormsg) {
			if (errormsg instanceof Error) {
				console.error("- " + Colors.red.colorize("Command call ended by JavaScript error:") +
					"\n\tCommand: " + command +
					"\n\tArgs: " + args +
					"\n\tTime taken: " + (Date.now() - start) +
					"\n\tCalled at: " + new Date() +
					"\n\tCaller: " + message.author.username +
					"\n\tChannel name: " + message.channel.name +
					"\n\tGuild name: " + message.guild.name +
					"\n\tError: " + errormsg.stack);
				message.channel.send(errormsg.toString().slice(0, 1900));
			} else if (typeof errormsg == "object") {
				console.error("- " + Colors.blue.colorize("Command call ended by missing argument:") +
					"\n\tCommand: " + command +
					"\n\tArgs: " + args +
					"\n\tTime taken: " + (Date.now() - start) +
					"\n\tCalled at: " + new Date() +
					"\n\tCaller: " + message.author.username +
					"\n\tChannel name: " + message.channel.name +
					"\n\tGuild name: " + message.guild.name +
					"\n\tArgument number: " + errormsg.num +
					"\n\tArgument name: " + errormsg.name);
				const ErrorEmbed = new Discord.MessageEmbed()
					.setColor("blurple")
					.setTitle("Missing argument " + (errormsg.num + 1) + "!")
					.setDescription(errormsg.msg.toString().slice(0, 1900))
					.setTimestamp()
					.setFooter("Missing argument name: " + errormsg.name)
				message.channel.send({
					embeds: [ErrorEmbed]
				})
			} else if (errormsg == "Only my developers can use this command") {
				console.error("- " + Colors.blue.colorize("Command call aborted due to the user not being a developer:") +
					"\n\tCommand: " + command +
					"\n\tArgs: " + args +
					"\n\tTime taken: " + (Date.now() - start) +
					"\n\tCalled at: " + new Date() +
					"\n\tCaller: " + message.author.username +
					"\n\tChannel name: " + message.channel.name +
					"\n\tGuild name: " + message.guild.name);
				message.channel.send(errormsg);
			} else {
				console.error("- " + Colors.yellow.colorize("Command call ended by thrown error:") +
					"\n\tCommand: " + command +
					"\n\tArgs: " + args +
					"\n\tTime taken: " + (Date.now() - start) +
					"\n\tCalled at: " + new Date() +
					"\n\tCaller: " + message.author.username +
					"\n\tChannel name: " + message.channel.name +
					"\n\tGuild name: " + message.guild.name +
					"\n\tError: " + errormsg);
				message.channel.send(errormsg.toString().slice(0, 1900));
			}
		}
	} else if (aliases.get(message.author.id)?.[command]) {
		const replaced = message.content
			.replace(rawCommand, aliases.get(message.author.id)[command])

		message.channel.send(`Parsed to: ${message.content
			.replace(rawCommand, '**' + aliases.get(message.author.id)[command] + '**')}`)

		handler(message,replaced)
	} else {
		message.channel.send(`That command doesn't exist buddy, use \`${prefix}help\` for a list of commands`)
	}
}

Commands.chain = new Commands.say.constructor("Executes multiple commands", (message, args) => {
	for (let v = 0; v < args.length; v++) {
		try {
			handler(message,args[v])
		} catch {

		}
	}
	message.channel.send(`Executed ${args.length} commands`)
}, "Utility")

client.on("ready", () => {
	console.log("- Bot ready")
	if (debugmode) console.log("- " + Colors.yellow.colorize("The current bot session is running in debug mode, no data will be saved"))
	client.user.setActivity("ping me for help")
})

client.on("messageCreate", (message) => {
	if (message.author.bot) return
	if (message.guild === null) {
		message.author.send("I can't answer command calls from DMs, join my official server for that!\nhttps://discord.gg/Qyz5HgrxWg")
		console.error("- " + Colors.blue.colorize("Potential command call ended due to call being in a Direct Message:") +
			"\n\tMessage: " + message.content +
			"\n\tCalled at: " + new Date() +
			"\n\tCaller: " + message.author.username)
		return
	}

	const prefix = Prefix.get(message.guild.id)

	if (message.content.trim() == "<@!" + client.user.id + ">" || message.content.trim() == "<@" + client.user.id + ">") {
		Commands.info.action(message); return;
	}

	if (!message.content.startsWith(prefix)) return;

	handler(message, message.content.slice(prefix.length), prefix)
})
