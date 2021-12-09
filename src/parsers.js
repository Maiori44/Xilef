const { RequiredArg, Command } = require("./commands.js")
const fs = require('fs')

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
        }
        const json = JSON.stringify(Object.fromEntries(this), null, 4);
        fs.writeFileSync("./src/Data/aliases.json", json, "utf8");
    }
}

const aliasHelp = `
\`&alias set (name) (substitute)\` set an alias for \`substitute\` with the name \`name\`
\`&alias get (name)\` get an alias with the name \`name\`
\`&alias delete\` show a menu to delete aliases
\`&alias clear\` clear all alias
\`&alias list\` list all alias
`.trim();

Commands.alias = new Command("Manage command aliases\n\n" + aliasHelp, async (message, [command, ...args]) => {
    switch (command) {
        case "set": {
            const [name, substitute] = args;

            if (name in Commands)
                return void message.channel.send("A command already uses that name");

            if (name == undefined)
                return void message.channel.send("I need a name for the alias pal");

            if (substitute == undefined)
                return void message.channel.send("An alias has to substitute to something, you know");

            aliases.set(message.author.id, {
                ...aliases.get(message.author.id),
                [name]: String(substitute)
            }).save();

      console.log("- " + Colors.cyan.colorize("Successfully added alias:") +
        "\n\tAlias name: " + name +
        "\n\tAlias substitute: " + substitute +
        "\n\tUser: " + message.author.username)

            message.channel.send("Alias set successfully");
            break;
        }
        case "get": {
            const [name] = args;

            if (name == undefined)
                return void message.channel.send("Nothing is not an alias");

            if (!(name in (aliases.get(message.author.id) ?? {})))
                return void message.channel.send("Couldn't find any alias with that name");

            message.channel.send(
                '```properties\n' +
                name + ' = ' + aliases.get(message.author.id)[name]
                + '\n```'
                ?? "Missing invalid name");
            break;
        }
        case "delete": {
            const selected = new Set();

            const deleteMessage = await message.channel.send("Loading aliases...");
            const userAliasesEntryChunks = Object.entries(aliases.get(message.author.id) ?? {})
                .reduce((chunks, entry, index) => {
                    const chunkIndex = Math.floor(index / 25);

                    (chunks[chunkIndex] ??= []).push(entry);

                    return chunks;
                }, []);

            if (userAliasesEntryChunks.length === 0)
                return void deleteMessage.edit("You don't have any alias set");

            deleteMessage.edit({
                content: 'Select one of your aliases to delete',
                components: userAliasesEntryChunks
                    .map((userAliasesEntries, chunkIndex) => {
                        return new Discord.MessageActionRow({
                            components: [
                                new Discord.MessageSelectMenu({
                                    customId: 'delete-select-menu#' + chunkIndex,
                                    placeholder: 'Choose which alias to delete',
                                    maxValues: userAliasesEntries.length,
                                    options: userAliasesEntries.map(([name, substitute]) => ({
                                        label: name,
                                        description: substitute.length > 100
                                            ? substitute.slice(0, 97) + '...'
                                            : substitute,
                                        value: name
                                    }))
                                })
                            ]
                        });
                    })
                    .concat(new Discord.MessageActionRow({
                        components: [
                            new Discord.MessageButton({
                                customId: 'delete-button',
                                style: 'PRIMARY',
                                label: 'Delete'
                            })
                        ]
                    }))
            })
                .then((deleteMessage) => {
                    const collector = deleteMessage.createMessageComponentCollector({
                        componentType: 'SELECT_MENU',
                        async filter(interaction) {
                            const isSameUser = interaction.user.id === message.author.id;

                            if (!isSameUser) {
                                await interaction.reply({
                                    content: "You can't delete someone else's alias",
                                    ephemeral: true
                                });
                            }

                            return isSameUser;
                        }
                    });

                    collector.on('collect', async (interaction) => {
                        for (const value of interaction.values) {
                            if (selected.has(value)) selected.delete(value);
                            else selected.add(value);
                        }

                        interaction.update({
                            content: 'Select one of your aliases to delete'
                                + (selected.size !== 0 ?
                                  '\n'
                                + '\nSelected:'
                                + `\n${[...selected]
                                    .map((value) => '`' + value + '`')
                                    .join(', ')
                                }`: ''),
                        })
                    });

                    return deleteMessage.awaitMessageComponent({
                        componentType: 'BUTTON',
                        async filter(interaction) {
                            const isSameUser = interaction.user.id === message.author.id;
                            const isSelected = selected.size !== 0;

                            if (!isSameUser) {
                                await interaction.reply({
                                    content: "You can't delete someone else's alias",
                                    ephemeral: true
                                });
                            }

                            if (!isSelected) {
                                await interaction.reply({
                                    content: "You can't delete nothing",
                                    ephemeral: true
                                });
                            } else collector.stop();

                            return isSameUser && isSelected;
                        }
                    })
                })
                .then((interaction) => {
                    const userAliases = aliases.get(message.author.id);

                    for (const name of selected) {
                        delete userAliases[name];
                    }

                    aliases.save();

                    interaction.update({
                        content: `Alias ${[...selected]
                            .map((value) => '`' + value + '`')
                            .join(', ')
                        } deleted successfully`,
                        components: []
                    });
                })
            break
        }
        case "clear":
            aliases.delete(message.author.id)
            aliases.save();
            message.channel.send("Aliases cleared successfully");
            break;
        case "list":
            message.channel.send({
                embeds: [
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
                                    .setFooter(`${Object.keys(aliases.get(message.author.id) ?? {}).length} aliases`))
                                    ]
            }
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
client.on('clickMenu', async (/** @type {MessageComponent} */ menu) => {
    if (menu.values[0] == "empty") return
    delete aliases.get(menu.clicker.id)[menu.values[0]]
    aliases.save();
    aliases.updateMenu(menu.id)
    await menu.reply.defer()
})
