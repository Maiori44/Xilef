require('dotenv').config()

const { Client, Collection } = require('discord.js')
const { Command } = require('./command.js')
const { Logger } = require('./logger.js')
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
        this.debugging = (process.argv[2] == "-debug") ? true : false
        this.prefix = this.debugging ? "beta&" : "&"
        this.logger = new Logger({
            canLog: this.debugging ? ["cmdSuccess", "fsSuccess", "instanceCreationSuccess", "jsError", "warning", "clientReady", "dbSuccess", "miscInfo "] : ["cmdSuccess", "jsError", "warning", "clientReady", "miscInfo"],
            useLogFile: !this.debugging // when debugging do not use a log file
        })
        this.economy = new EconomySystem({
            logger: this.logger
        })
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
                    this.logger.fileSystemOperationSuccess("Loaded command '" + command.name + "' successfully (" + (this.commands.size + 1) + " commands loaded)")
                    this.commands.set(command.name, command)
                })
            }
        })()


        fs.readdirSync('./src/events/')
            .filter(file => file.endsWith('.js'))
            .forEach((file) => {
                const event = require(`./events/${file}`)
                this.logger.fileSystemOperationSuccess("Loaded event '" + event.event + "' successfully")
                this.on(event.event, event.run.bind(null, this))
            })
        this.login(token)
    }
}

module.exports = {
    LocalClient
}