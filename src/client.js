require('dotenv').config()

const { Client, Collection } = require('discord.js')
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
        this.achievements = {
            first: ["<:golden_medal:874402462902128656> reach 1st place in the leaderboard", 1],
            reversi: ["<:black_circle:869976829811884103> win 15 reversi matches", 2],
            connect4: ["<:yellow_circle:870716292515106846> win 15 connect 4 matches", 3],
            crew: ["<:imposter:874402966084395058> eject 25 impostors in crew", 4],
            driller: ["<:driller:874403362827796530> reach tier 30 in driller", 5],
            v_: ["<:v_c:873259417557151765> find all v_s", 6],
            dungeon: ["<:dungeon:875809577487192116> reach floor 50 in dungeon", 7],
            msweeper: ["💥 win at minesweeper 10 times", 8],
            roshambo: [":rock: win at roshambo 25 times", 9]
        }
        this.achievements.binary = Object.keys(this.achievements).map(key =>
            this.achievements[key][0] + "\n"
        )
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