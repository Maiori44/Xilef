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
            roshambo: [":rock: win at roshambo 25 times", 9],
        }
        this.achievements.binary = Object.keys(this.achievements).map(key =>
            this.achievements[key][0] + "\n"
        )
        this.funnyFaces = {
            binary: [
                "<:abyssv_c:873259417041268746>",
                "<:concernedv_c:873259417708154880>",
                "<:cringev_c:873259417007718421>",
                "<:cyclopsv_c:873259417418731531>",
                "<:doublev_c:873259417733312613>",
                "<:evilv_c:873259417813012531>",
                "<:happyv_c:873259416680554506>",
                "<:limev_c:873259416722489434>",
                "<:observantv_c:873259416923820092>",
                "<:oov_c:873259416458264646>",
                "<:lowresv_c:873259416365981736>",
                "<:sadv_c:873259416202383410>",
                "<:spiderv_c:873259415636156419>",
                "<:starev_c:873259415732629615>",
                "<:tinyeyesv_c:873259415778758708>",
                "<:ughv_c:873259415657119764>",
                "<:v_c:873259417557151765>",
                "<:compressedv_c:873259415581646928>",
                "<:burningv_r:873259766296764447>",
                "<:comprstarev_r:873259766317711370>",
                "<:distortedv_r:873259766418399302>",
                "<:fullbluev_r:873259765894107138>",
                "<:fullgreenv_r:873259766103805982>",
                "<:greenlossv_r:873259765726326825>",
                "<:invertedv_r:873259766145757254>",
                "<:matrixv_r:873259765160083528>",
                "<:purplecyanv_r:873259765562744882>",
                "<:reddecayv_r:873259765000716442>",
                "<:redstarev_r:873259765143322684>",
                "<:shadoweyesv_r:873259765118152704>",
                "<:spectrev_r:873259764820361317>",
                "<:voidlinev_r:873259765046865940>",
                "<:voidghostv_e:873260170799640616>",
                "<:colorpainv_e:873260170820608001>",
                "<:deathstarev_e:873260170552156221>",
                "<:ghostv_e:873260170464071700>",
                "<:greencyanov_e:873260170392793128>",
                "<:hypervoidv_e:873260169834946621>",
                "<:ultravoidv_e:873260170690588683>",
                "<:oblivionv_e:873260170053029929>",
                "<:ohnov_e:873260170371801128>",
                "<:painv_e:873260170254376990>",
                "<:radiationv_e:873260169872683028>",
                "<:voidv_e:873260169658761236>",
                "<:voidvoidv_e:873260169767817227>",
                "<:3dv_l:873260538090635355>",
                "<:crazyv_l:873260538203885568>",
                "<:heateyev_l:873260537180479540>",
                "<:hypericev_l:873483425816920166>",
                "<:hyperfirev_l:873483425548476456>",
                "<:chaosvoidv_l:873260537809616967>",
                "<:neonv_l:873260537654435881>",
                "<:plasmav_l:873260537813803049>",
                "<:purplebeamv_l:873260538086432809>",
                "<:alienv_l:873260537394380820>",
                "<:bloodv_l:873260537503420426>",
                "<:phantomv_l:873260537201455165>",
                "<:corruptedv_l:873260537184673942>",
                "<:deadapplev_l:873260536647778385>",
                "<:deathvoidv_l:873260536719110175>",
            ],
            common: [
                ["<:abyssv_c:873259417041268746>", 1],
                ["<:concernedv_c:873259417708154880>", 2],
                ["<:cringev_c:873259417007718421>", 3],
                ["<:cyclopsv_c:873259417418731531>", 4],
                ["<:doublev_c:873259417733312613>", 5],
                ["<:evilv_c:873259417813012531>", 6],
                ["<:happyv_c:873259416680554506>", 7],
                ["<:limev_c:873259416722489434>", 8],
                ["<:observantv_c:873259416923820092>", 9],
                ["<:oov_c:873259416458264646>", 10],
                ["<:lowresv_c:873259416365981736>", 11],
                ["<:sadv_c:873259416202383410>", 12],
                ["<:spiderv_c:873259415636156419>", 13],
                ["<:starev_c:873259415732629615>", 14],
                ["<:tinyeyesv_c:873259415778758708>", 15],
                ["<:ughv_c:873259415657119764>", 16],
                ["<:v_c:873259417557151765>", 17],
                ["<:compressedv_c:873259415581646928>", 18],
            ],
            rare: [
                ["<:burningv_r:873259766296764447>", 19],
                ["<:comprestarev_r:873259766317711370>", 20],
                ["<:distortedv_r:873259766418399302>", 21],
                ["<:fullbluev_r:873259765894107138>", 22],
                ["<:fullgreenv_r:873259766103805982>", 23],
                ["<:greenlossv_r:873259765726326825>", 24],
                ["<:invertedv_r:873259766145757254>", 25],
                ["<:matrixv_r:873259765160083528>", 26],
                ["<:purplecyanv_r:873259765562744882>", 27],
                ["<:reddecayv_r:873259765000716442>", 28],
                ["<:redstarev_r:873259765143322684>", 29],
                ["<:shadoweyesv_r:873259765118152704>", 30],
                ["<:spectrev_r:873259764820361317>", 31],
                ["<:voidlinev_r:873259765046865940>", 32],
            ],
            epic: [
                ["<:voidghostv_e:873260170799640616>", 33],
                ["<:colorpainv_e:873260170820608001>", 34],
                ["<:deathstarev_e:873260170552156221>", 35],
                ["<:ghostv_e:873260170464071700>", 36],
                ["<:greencyanov_e:873260170392793128>", 37],
                ["<:hypervoidv_e:873260169834946621>", 38],
                ["<:ultravoidv_e:873260170690588683>", 39],
                ["<:oblivionv_e:873260170053029929>", 40],
                ["<:ohnov_e:873260170371801128>", 41],
                ["<:painv_e:873260170254376990>", 42],
                ["<:radiationv_e:873260169872683028>", 43],
                ["<:voidv_e:873260169658761236>", 44],
                ["<:voidvoidv_e:873260169767817227>", 45],
            ],
            legendary: [
                ["<:3dv_l:873260538090635355>", 46],
                ["<:crazyv_l:873260538203885568>", 47],
                ["<:heateyev_l:873260537180479540>", 48],
                ["<:hypericev_l:873483425816920166>", 49],
                ["<:hyperfirev_l:873483425548476456>", 50],
                ["<:chaosvoidv_l:873260537809616967>", 51],
                ["<:neonv_l:873260537654435881>", 52],
                ["<:plasmav_l:873260537813803049>", 53],
                ["<:purplebeamv_l:873260538086432809>", 54],
                ["<:alienv_l:873260537394380820>", 55],
                ["<:bloodv_l:873260537503420426>", 56],
                ["<:phantomv_l:873260537201455165>", 57],
                ["<:corruptedv_l:873260537184673942>", 58],
                ["<:deadapplev_l:873260536647778385>", 59],
                ["<:deathvoidv_l:873260536719110175>", 60],
            ],
        }
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