require('dotenv').config()

const { Client, Collection } = require('discord.js')
const { Command } = require('./command.js')
const { XilefUser, Balance } = require('./economy.js')
const Logger = require('./logger.js')
const { Event } = require('./event.js')
const fs = require('fs')
const path = require('path')

class LocalClient extends Client {
    constructor(intents) {
        super({ intents })

        /**
         * @type {Collection<string, Command>}
         */
        this.commands = new Collection()
        this.debugging = process.argv[2] == "-debug" ? true : false
        this.prefix = this.debugging ? "beta&" : "&"
        this.economy = {
            list: JSON.parse(fs.readFileSync('./src/data/economy.json', 'utf-8')),
            
            // /**
            //  * 
            //  * @param {Number} discordId The user's discord ID
            //  * @returns {XilefUser}
            //  */
            // getUser(discordId) {
            //     if (!this.list[discordId]) {
            //         this.list[discordId] = new XilefUser({ 
            //             discordId = discordId, 
            //             driller = 0,
            //             balance = new Balance()
            //         })
            //     }
            // },
            async reload() {
                this.list = JSON.parse(fs.readFileSync('./src/data/economy.json', 'utf-8'))
            },
            async save() {
                let newJson = JSON.parse(fs.readFileSync('./src/data/economy.json', 'utf-8'))

                newJson = { ...json, ...this.list}

                fs.writeFile('./src/data/economy.json', JSON.stringify(newJson, null, 4), 'utf-8')
            }
        
        
        }
        this.logger = Logger.create({ 
            canLog: this.debugging ? [ "cmdSuccess", "fsSuccess", "instanceCreationSuccess", "jsError", "warning" ] : undefined,
            useLogFile: !this.debugging // when debugging do not use a log file
        })
    }

    start(token) {
        async function* getFilesRecursively(dir) {
            const dirents = fs.readdirSync(dir, { withFileTypes: true })
            for (const dirent of dirents) {
                const res = path.resolve(dir, dirent.name);
                if (dirent.isDirectory()) {
                    yield * getFilesRecursively(res);
                } else {
                    yield res;
                }
            }
        }

        ;(async () => {
            for await (const file of getFilesRecursively('./src/commands')) {
                if (!file.endsWith('.js')) continue;
                /**
                 * @type {Command}
                 */
                const command = require(`${file}`)
                this.logger.fileSystemOperationSuccess("Loaded command '" + command.name + "' successfully")
                this.commands.set(command.name, command)
            }
        })()


        fs.readdirSync('./src/events/')
            .filter(file => file.endsWith('.js'))
            .forEach((file) => {
                /**
                 * @type {Event}
                 */
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