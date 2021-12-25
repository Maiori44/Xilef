require('dotenv').config()
const fs = require('fs')
const Logger = require('logplease')

// loggers
const _debugging = process.argv[2] == "-debug"

const economyLogger = Logger.create("economy", { 
    color: Logger.Colors.Cyan
})
const clientLogger = Logger.create("client", {
    color: Logger.Colors.Green
})
const eventLogger = Logger.create("event", {
    color: Logger.Colors.Blue
})

fs.stat('./src/data/logs', (err, stat) => {
    if (stat.size > 4096) {
        fs.rmdirSync('./src/data/logs', { force: true })
        fs.mkdirSync('./src/data/logs')
    }
})
Logger.setLogfile('./src/data/logs/' + new Date().toString())
Logger.setLogLevel(_debugging ? Logger.LogLevels.DEBUG : Logger.LogLevels.INFO)

economyLogger.info("started up economy logger")
clientLogger.info("started up client logger")
eventLogger.info("started up event logger")

// arrays
const achievements = {
    first: ["<:golden_medal:874402462902128656> reach 1st place in the leaderboard", 1],
    reversi: ["<:black_circle:869976829811884103> win 15 reversi matches", 2],
    connect4: ["<:yellow_circle:870716292515106846> win 15 connect 4 matches", 3],
    crew: ["<:imposter:874402966084395058> eject 25 impostors in crew", 4],
    driller: ["<:driller:874403362827796530> reach tier 30 in driller", 5],
    v_: ["<:v_c:873259417557151765> find all v_s", 6],
    dungeon: ["<:dungeon:875809577487192116> reach floor 50 in dungeon", 7],
    msweeper: ["💥 win at minesweeper 10 times", 8],
    roshambo: [":rock: win at roshambo 25 times", 9],
    clash: [ ]
}

achievements.binary = Object.keys(achievements).map(key =>
    achievements[key][0] + "\n"
)

const funnyFaces = {
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
    ]
}

{
    const funnyKeys = funnyFaces.binary
        .map((key, index) => [ key, index + 1 ])

    funnyFaces.common    = funnyKeys.slice(00, 17)
    funnyFaces.rare      = funnyKeys.slice(17, 31)
    funnyFaces.epic      = funnyKeys.slice(31, 44)
    funnyFaces.legendary = funnyKeys.slice(44, 60)
}

Object.keys(funnyFaces).forEach(value => {
    funnyFaces[value].forEach(funy => console.log(funy))  
})

module.exports = {
    economyLogger,
    clientLogger,
    eventLogger,
    funnyFaces,
    achievements
}