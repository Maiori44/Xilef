const { client, isDebugging } = require('./constants.js');
const fs = require('fs')
const path = require('path')
const { Collection } = require('discord.js');

require("./economy.js")
require("./parsers.js")
require("./minigames.js")
require('./developer.js')

client.prefix = isDebugging ? "beta&" : "&"
client.commands = new Collection()

const eventFiles = fs.readdirSync(path.resolve(__dirname, './events/')).filter(file => file.endsWith('.js'))

for (const eventFile of eventFiles) {
    const eventName = eventFile.split(".")[0]
    const event = require(`./events/${eventFile}`)

    client.on(eventName, event.bind(null, client))
}

const commandFiles = [];


function* getFiles(dir) {
    const dirents = fs.readdirSync(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = path.resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFiles(res);
        } else {
            yield res;
        }
    }
}

for (const f of getFiles('./src/Commands')) {
    if (f.endsWith('.js')) {
        commandFiles.push(f)
    }
}


for (const commandFile of commandFiles) {
    const command = require(commandFile)

    async () => {
        client.commands.set(command.name, command)
    }
}

client.login(isDebugging ? process.env.DEBUG : process.env.TOKEN)