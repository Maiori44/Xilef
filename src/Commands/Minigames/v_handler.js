const { Message, Webhook } = require("discord.js")
const { RequiredArg, Command, Commands } = require("../../commands.js")

const vTypes = {
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
        new Economy.flag("<:abyssv_c:873259417041268746>", 1),
        new Economy.flag("<:concernedv_c:873259417708154880>", 2),
        new Economy.flag("<:cringev_c:873259417007718421>", 3),
        new Economy.flag("<:cyclopsv_c:873259417418731531>", 4),
        new Economy.flag("<:doublev_c:873259417733312613>", 5),
        new Economy.flag("<:evilv_c:873259417813012531>", 6),
        new Economy.flag("<:happyv_c:873259416680554506>", 7),
        new Economy.flag("<:limev_c:873259416722489434>", 8),
        new Economy.flag("<:observantv_c:873259416923820092>", 9),
        new Economy.flag("<:oov_c:873259416458264646>", 10),
        new Economy.flag("<:lowresv_c:873259416365981736>", 11),
        new Economy.flag("<:sadv_c:873259416202383410>", 12),
        new Economy.flag("<:spiderv_c:873259415636156419>", 13),
        new Economy.flag("<:starev_c:873259415732629615>", 14),
        new Economy.flag("<:tinyeyesv_c:873259415778758708>", 15),
        new Economy.flag("<:ughv_c:873259415657119764>", 16),
        new Economy.flag("<:v_c:873259417557151765>", 17),
        new Economy.flag("<:compressedv_c:873259415581646928>", 18),
    ],
    rare: [
        new Economy.flag("<:burningv_r:873259766296764447>", 19),
        new Economy.flag("<:comprestarev_r:873259766317711370>", 20),
        new Economy.flag("<:distortedv_r:873259766418399302>", 21),
        new Economy.flag("<:fullbluev_r:873259765894107138>", 22),
        new Economy.flag("<:fullgreenv_r:873259766103805982>", 23),
        new Economy.flag("<:greenlossv_r:873259765726326825>", 24),
        new Economy.flag("<:invertedv_r:873259766145757254>", 25),
        new Economy.flag("<:matrixv_r:873259765160083528>", 26),
        new Economy.flag("<:purplecyanv_r:873259765562744882>", 27),
        new Economy.flag("<:reddecayv_r:873259765000716442>", 28),
        new Economy.flag("<:redstarev_r:873259765143322684>", 29),
        new Economy.flag("<:shadoweyesv_r:873259765118152704>", 30),
        new Economy.flag("<:spectrev_r:873259764820361317>", 31),
        new Economy.flag("<:voidlinev_r:873259765046865940>", 32),
    ],
    epic: [
        new Economy.flag("<:voidghostv_e:873260170799640616>", 33),
        new Economy.flag("<:colorpainv_e:873260170820608001>", 34),
        new Economy.flag("<:deathstarev_e:873260170552156221>", 35),
        new Economy.flag("<:ghostv_e:873260170464071700>", 36),
        new Economy.flag("<:greencyanov_e:873260170392793128>", 37),
        new Economy.flag("<:hypervoidv_e:873260169834946621>", 38),
        new Economy.flag("<:ultravoidv_e:873260170690588683>", 39),
        new Economy.flag("<:oblivionv_e:873260170053029929>", 40),
        new Economy.flag("<:ohnov_e:873260170371801128>", 41),
        new Economy.flag("<:painv_e:873260170254376990>", 42),
        new Economy.flag("<:radiationv_e:873260169872683028>", 43),
        new Economy.flag("<:voidv_e:873260169658761236>", 44),
        new Economy.flag("<:voidvoidv_e:873260169767817227>", 45),
    ],
    legendary: [
        new Economy.flag("<:3dv_l:873260538090635355>", 46),
        new Economy.flag("<:crazyv_l:873260538203885568>", 47),
        new Economy.flag("<:heateyev_l:873260537180479540>", 48),
        new Economy.flag("<:hypericev_l:873483425816920166>", 49),
        new Economy.flag("<:hyperfirev_l:873483425548476456>", 50),
        new Economy.flag("<:chaosvoidv_l:873260537809616967>", 51),
        new Economy.flag("<:neonv_l:873260537654435881>", 52),
        new Economy.flag("<:plasmav_l:873260537813803049>", 53),
        new Economy.flag("<:purplebeamv_l:873260538086432809>", 54),
        new Economy.flag("<:alienv_l:873260537394380820>", 55),
        new Economy.flag("<:bloodv_l:873260537503420426>", 56),
        new Economy.flag("<:phantomv_l:873260537201455165>", 57),
        new Economy.flag("<:corruptedv_l:873260537184673942>", 58),
        new Economy.flag("<:deadapplev_l:873260536647778385>", 59),
        new Economy.flag("<:deathvoidv_l:873260536719110175>", 60),
    ]
}

Commands.roll = new Command('Get a random funny looking "v_", try to collect all 60!', (message) => {
    let hour = Date.now()
    let EconomySystem = Economy.getEconomySystem(message.author)
    let diff = hour - EconomySystem.vhour
    if (diff >= Time.hour) {
        if (EconomySystem.buy(200 * (EconomySystem.rank / 4), message, undefined, "You don't have enough DogeCoins for a v_ (" + 200 * (EconomySystem.rank / 4) + " DogeCoins needed)", true)) {
            let chance = GetPercentual()
            let rarity = chance >= 90 ? "legendary" : chance >= 50 ? "common" : chance >= 20 ? "rare" : "epic"
            let v_s = vTypes[rarity]
            let v_got = v_s[Math.floor(Math.random() * v_s.length)]
            message.channel.send("You got " + v_got.id + "! (" + rarity + "!)")
            if (EconomySystem.vgot.checkFlag(v_got.value)) {
                message.channel.send("Oh..you already had " + v_got.id + "..I can give you back half of what you paid")
                EconomySystem.give((200 * (EconomySystem.rank / 4)) / 2)
            } else {
                EconomySystem.vgot.addFlag(v_got.value)
                message.channel.send({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setColor(message.member.displayHexColor)
                            .setTitle(EconomySystem.user + "'s v_s")
                            .setDescription(EconomySystem.vgot.getBinary(vTypes.binary, "❔"))
                            .setTimestamp()
                    ]
                })
                if (EconomySystem.vgot.getBinary() == "111111111111111111111111111111111111111111111111111111111111") {
                    EconomySystem.award("v_", message)
                }
            }
            EconomySystem.vhour = hour
        }
    } else {
        throw ("You already got a v_ recently, you can get a new one in " + Time.convertTime(Time.hour - diff) + "!")
    }
}, "Game")

Commands.vsend = new Command("Send the v_s you have collected as messages!", (message, args) => {
    const requestedv_ = [...vTypes.common, ...vTypes.rare, ...vTypes.epic, ...vTypes.legendary].find(({id}) =>
        id.startsWith('<:' + args[0]))
    if (!requestedv_) {
        message.channel.send("Could not find the v_\nperhaps you mistyped?")
        return
    }
    if (!Economy.getEconomySystem(message.author).vgot.checkFlag(requestedv_.value)) {
        message.channel.send("You are not in possession of this v_")
        return
    }
    message.channel.createWebhook("v_ sender", {
        avatar: client.user.displayAvatarURL(),
        reason: `The user "${message.author.username}" used the "vsend" command`
    })
        .then(webhook => {
            webhook.send({
                content: requestedv_.id,
                username: message.author.username,
                avatarURL: message.author.displayAvatarURL()
            })
                .then(() => {
                    webhook.delete("The requested message has been sent, this webhook has no need to stay")
                    message.delete()
                })
                .catch(() => {
                    message.channel.send("Could not send the v_\nperhaps you mistyped?")
                })
        })
        .catch(() => {
            message.channel.send("Could not create the webhook, check if I have the manage webhook permissions in this server")
        })
}, "Utility", [new RequiredArg(0, "You need to type the v_'s name to send one", "v_'s name")])
