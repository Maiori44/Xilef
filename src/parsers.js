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
		console.log("- " + Colors.blue.colorize("Aborted server prefix update due to Debug mode:") +
			"\n\tCurrent prefix: " + Prefix.get(message.guild.id) +
			"\n\tRequested prefix: " + args[0] +
			"\n\tGuild name: " + message.guild.name +
			"\n\tGuild ID: " + message.guild.id)
		console.log("- " + Colors.blue.colorize("Update of ") + Colors.hblue.colorize("prefixes.json") + Colors.blue.colorize(" was cancelled due to debug mode being active"))
		throw ("This command cannot be used while in debug mode")
	}
	if (!message.member.permissions.has("MANAGE_GUILD")) {
		console.log("- " + Colors.blue.colorize("Aborted server prefix update due to missing permissions:") +
			"\n\tCurrent prefix: " + Prefix.get(message.guild.id) +
			"\n\tRequested prefix: " + args[0] +
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

aliases = new class extends Discord.Collection {
    constructor() {
        super();
        this.reload();
    }
    reload() {
        const object = JSON.parse(fs.readFileSync("./src/Data/aliases.json", "utf-8"));

        Object.entries(object).forEach(([key, value]) => {
            this.set(key, value);
        });
    }
    save() {
		if (debugmode) {
			console.log("- " + Colors.blue.colorize("Update of ") + Colors.hblue.colorize("aliases.json") + Colors.blue.colorize(" was cancelled due to debug mode being active"))
			return
		}
        const json = JSON.stringify(Object.fromEntries(this), null, 4);
        fs.writeFileSync("./src/Data/aliases.json", json, "utf8");
    }
}
const aliasHelp = `
\`&alias set (name) (substitute)\` set an alias for \`substitute\` with the name \`name\`
\`&alias get (name)\` get an alias with the name \`name\`
\`&alias delete (name)\` delete an alias with the name \`name\`
\`&alias clear\` clear all alias
\`&alias list\` list all alias
`.trim();

Commands.alias = new Command("Manage command aliases\n\n" + aliasHelp, (message, [command, ...args]) => {
    switch (command) {
        case "set": {
            const [name, substitute] = args;

            if (name in Commands)
                return void message.channel.send("error: an existing command already has the specified name");

            if (name == undefined)
                return void message.channel.send("error: missing alias name");

            if (substitute == undefined)
                return void message.channel.send("error: missing alias value");

            aliases.set(message.author.id, {
                ...aliases.get(message.author.id),
                [name]: String(substitute)
            }).save();

			console.log("- " + Colors.cyan.colorize("Successfully added alias:") +
				"\n\tAlias name: " + name +
				"\n\tAlias substitute: " + substitute +
				"\n\tUser: " + message.author.username)

            message.channel.send("alias set successfully");
            break;
        }
        case "get": {
            const [name] = args;

            if (name == undefined)
                return void message.channel.send("error: missing alias name");

            if (!(name in (aliases.get(message.author.id) ?? {})))
                return void message.channel.send("error: invalid alias name");

            message.channel.send(
                '```properties\n' +
                name + ' = ' + aliases.get(message.author.id)[name]
                + '\n```'
                ?? "error: missing invalid name");
            break;
        }
        case "delete": {
            const [name] = args;

            if (name == undefined)
                return void message.channel.send("error: missing alias name");

            if (!(name in (aliases.get(message.author.id) ?? {})))
                return void message.channel.send("error: invalid alias name");

            delete aliases.get(message.author.id)[name]
            aliases.save();
            message.channel.send("alias deleted successfully");
            break;
        }
        case "clear":
            aliases.delete(message.author.id)
            aliases.save();
            message.channel.send("aliases cleared successfully");
            break;
        case "list":
            message.channel.send(
                new Discord.MessageEmbed()
                    .setTitle(`${message.author.username}'s aliases`)
                    .setDescription(
                        Object.keys(aliases.get(message.author.id) ?? {}).length > 0 ?
                            '```properties\n' +
                            Array.from(Object.entries(aliases.get(message.author.id) ?? {}))
                                .map(([name, substitute]) =>
                                    `${name} = ${/[^A-Za-z0-9_$]/.test(substitute)
                                        ? '"' + substitute + '"'
                                        : substitute
                                    }`
                                ).join('\n')
                            + '\n```' : '```\n<empty>\n```'
                    )
                    .setFooter(`${Object.keys(aliases.get(message.author.id) ?? {}).length} aliases`)
            )
            break;
        default:
            message.channel.send(aliasHelp.replace(/&/g, Prefix.get(message.guild.id)))
            break
    }
}, "Utility", [
    new RequiredArg(0, aliasHelp, "command"),
    new RequiredArg(1, undefined, "argument 1", true),
	new RequiredArg(1, undefined, "argument 2", true),
])