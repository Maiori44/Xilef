require('dotenv').config()

const { parsedValues } = require('../parser.js')
const { Client, Collection } = require('discord.js')
const { clientLogger } = require('../constants.js')
const { EconomySystem } = require('./economy.js')
const fs = require('fs')
const path = require('path')

class LocalClient extends Client {
    constructor(intents) {
        super({ intents })

        /**
         * @type {Collection<string, Command>}
         */
        this.commands = new Collection()
        this.debugging = parsedValues.debugging
        this.prefix = this.debugging ? "beta&" : "&"
        this.logger = clientLogger
        this.economy = new EconomySystem()
    }

    start(token) {
        async function* getFilesRecursively(dir) {
            const dirents = fs.readdirSync(dir, { withFileTypes: true })
            for (const dirent of dirents) {
                const res = path.resolve(dir, dirent.name);
                if (dirent.isDirectory()) {
                    yield* getFilesRecursively(res);
                } else {
                    yield res;
                }
            }
        }

        ; (async () => {
            for await (const file of getFilesRecursively('./src/commands')) {
                if (!file.endsWith('.js')) continue;

                require(`${file}`).forEach((command) => {
                    clientLogger.log(`successfully created command ${command.name} (${this.commands.size + 1} commands loaded)`)
                    this.commands.set(command.name, command)
                })
            }
        })()


        fs.readdirSync('./src/events/')
            .filter(file => file.endsWith('.js'))
            .forEach((file) => {
                const event = require(`../events/${file}`)
                clientLogger.log(`successfully created event ${event.event}`)
                this.on(event.event, event.run.bind(null, this))
            })

        this.login(token)
    }
}

module.exports = {
    LocalClient
}