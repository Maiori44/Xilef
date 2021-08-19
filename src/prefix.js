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

Commands.prefix = new Command('Changes the prefix for the current server. Put `default` as the argument of `prefix` to reset the current server-prefix to the global prefix', (message , args) => {
    if (debugmode) throw ("This command cannot be used while in debug mode")
    fs.writeFileSync(
        "./src/Data/prefixes.json",
        JSON.stringify(
            {
                ...Prefix.read(),
                [message.guild.id]: args[0] == 'default' ? undefined: args[0]
            }, null, 4
        ),
        "utf8"
    )
}, 'Utility', [new RequiredArg(0, 'Missing `prefix` argument', 'prefix')])
