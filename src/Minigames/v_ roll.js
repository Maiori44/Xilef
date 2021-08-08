const { RequiredArg, Command } = require("./../commands.js")

class v_ {
    constructor(id, bit) {
        this.id = id
        this.value = 2 ** bit - 2 ** (bit - 1)
    }
}

v_Types = {
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
        "<:oov_co:873259416458264646>",
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
        new v_("<:abyssv_c:873259417041268746>", 1),
        new v_("<:concernedv_c:873259417708154880>", 2),
        new v_("<:cringev_c:873259417007718421>", 3),
        new v_("<:cyclopsv_c:873259417418731531>", 4),
        new v_("<:doublev_c:873259417733312613>", 5),
        new v_("<:evilv_c:873259417813012531>", 6),
        new v_("<:happyv_c:873259416680554506>", 7),
        new v_("<:limev_c:873259416722489434>", 8),
        new v_("<:observantv_c:873259416923820092>", 9),
        new v_("<:oov_co:873259416458264646>", 10),
        new v_("<:lowresv_c:873259416365981736>", 11),
        new v_("<:sadv_c:873259416202383410>", 12),
        new v_("<:spiderv_c:873259415636156419>", 13),
        new v_("<:starev_c:873259415732629615>", 14),
        new v_("<:tinyeyesv_c:873259415778758708>", 15),
        new v_("<:ughv_c:873259415657119764>", 16),
        new v_("<:v_c:873259417557151765>", 17),
        new v_("<:compressedv_c:873259415581646928>", 18),
    ],
    rare: [
        new v_("<:burningv_r:873259766296764447>", 19),
        new v_("<:comprestarev_r:873259766317711370>", 20),
        new v_("<:distortedv_r:873259766418399302>", 21),
        new v_("<:fullbluev_r:873259765894107138>", 22),
        new v_("<:fullgreenv_r:873259766103805982>", 23),
        new v_("<:greenlossv_r:873259765726326825>", 24),
        new v_("<:invertedv_r:873259766145757254>", 25),
        new v_("<:matrixv_r:873259765160083528>", 26),
        new v_("<:purplecyanv_r:873259765562744882>", 27),
        new v_("<:reddecayv_r:873259765000716442>", 28),
        new v_("<:redstarev_r:873259765143322684>", 29),
        new v_("<:shadoweyesv_r:873259765118152704>", 30),
        new v_("<:spectrev_r:873259764820361317>", 31),
        new v_("<:voidlinev_r:873259765046865940>", 32),
    ],
    epic: [
        new v_("<:voidghostv_e:873260170799640616>", 33),
        new v_("<:colorpainv_e:873260170820608001>", 34),
        new v_("<:deathstarev_e:873260170552156221>", 35),
        new v_("<:ghostv_e:873260170464071700>", 36),
        new v_("<:greencyanov_e:873260170392793128>", 37),
        new v_("<:hypervoidv_e:873260169834946621>", 38),
        new v_("<:ultravoidv_e:873260170690588683>", 39),
        new v_("<:oblivionv_e:873260170053029929>", 40),
        new v_("<:ohnov_e:873260170371801128>", 41),
        new v_("<:painv_e:873260170254376990>", 42),
        new v_("<:radiationv_e:873260169872683028>", 43),
        new v_("<:voidv_e:873260169658761236>", 44),
        new v_("<:voidvoidv_e:873260169767817227>", 45),
    ],
    legendary: [
        new v_("<:3dv_l:873260538090635355>", 46),
        new v_("<:crazyv_l:873260538203885568>", 47),
        new v_("<:heateyev_l:873260537180479540>", 48),
        new v_("<:hypericev_l:873483425816920166>", 49),
        new v_("<:hyperfirev_l:873483425548476456>", 50),
        new v_("<:chaosvoidv_l:873260537809616967>", 51),
        new v_("<:neonv_l:873260537654435881>", 52),
        new v_("<:plasmav_l:873260537813803049>", 53),
        new v_("<:purplebeamv_l:873260538086432809>", 54),
        new v_("<:alienv_l:873260537394380820>", 55),
        new v_("<:bloodv_l:873260537503420426>", 56),
        new v_("<:phantomv_l:873260537201455165>", 57),
        new v_("<:corruptedv_l:873260537184673942>", 58),
        new v_("<:deadapplev_l:873260536647778385>", 59),
        new v_("<:deathvoidv_l:873260536719110175>", 60),
    ]
}

Commands.roll = new Command('Get a random funny looking "v_", try to collect all 60!', (message, args) => {
    let hour = Date.now()
    let EconomySystem = Economy.getEconomySystem(message.author)
    let diff = hour - EconomySystem.vhour
    if (diff >= Date.hour) {
        if (EconomySystem.buy(200 * (EconomySystem.rank / 4), message, undefined, "You don't have enough DogeCoins for a v_ (" + 200 * (EconomySystem.rank / 4) + " DogeCoins needed)")) {
            let chance = GetPercentual()
            let rarity = chance >= 90 ? "legendary" : chance >= 50 ? "common" : chance >= 20 ? "rare" : "epic"
            let v_s = v_Types[rarity]
            let v_got = v_s[Math.floor(Math.random() * v_s.length)]
            message.channel.send("You got " + v_got.id + "! (" + rarity + "!)")
            EconomySystem.vgot.addFlag(v_got.value)
            message.channel.send(new Discord.MessageEmbed()
                .setColor(message.member.displayHexColor)
                .setTitle(EconomySystem.user + "'s v_s")
                .setDescription(EconomySystem.vgot.getBinary(v_Types.binary, "❔"))
                .setTimestamp())
            EconomySystem.vhour = hour
        }
    } else {
        throw ("You arleady got a v_ today, you can get a new one in " + Math.floor((Date.hour - diff) / 1000) + " seconds!")
    }
}, "Game")
