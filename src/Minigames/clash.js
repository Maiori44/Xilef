const { MessageActionRow } = require("discord.js");
const { RequiredArg, Command } = require("./../commands.js")
const { Matrix } = require("./../matrix.js")

class ClashMatrix extends Matrix {
    constructor(data) {
        super(10, 10, ":black_large_square:")
        let udata = ""
        for (let i = 0; i < data.length; i++) {
            const amount = data[i++].charCodeAt()
            const char = data[i]
            udata += char.repeat(amount)
        }
        let pos = 0
        for (const Cell of this) {
            Cell.value = udata[pos]
            pos++
        }
    }

    toJSON() {
        let currentBuilding = this.at(0, 0)
        let amount = 0
        let data = ""
        for (const Cell of this) {
            const building = Cell.value
            if (building == currentBuilding) amount++
            else {
                data += String.fromCharCode(amount) + currentBuilding
                currentBuilding = building
                amount = 1
            }
        }
        data += String.fromCharCode(amount) + currentBuilding
        return data
    }

    toEmbed(EconomySystem) {
        const BuildsNum = {}
        const MatrixEmbed = new Discord.MessageEmbed()
            .setColor("#FFA500")
            .setTitle(EconomySystem.user + "'s village")
            .setTimestamp()
            .setDescription(this.map((Cell) => {
                const build = Cell.value
                if (BuildsNum[build]) BuildsNum[build]++
                else {BuildsNum[build] = 1}
                return Clash.emojis[build]
            }).toString())
        delete BuildsNum.N
        delete BuildsNum.T
        console.log(JSON.stringify(BuildsNum))
        for (const build of Object.keys(BuildsNum)) {
            console.log(build)
            MatrixEmbed.addField(Clash.emojis[build], BuildsNum[build] + " built", true)
        }
        MatrixEmbed.addFields(
            {
                name: "DogeCoins production:",
                value: `${BuildsNum.M ?? 0} every second`,
                inline: false
            },
            {
                name: "Attack Power:",
                value: (1 + 3 * (BuildsNum.M ?? 0)).toString(),
                inline: false
            }
        )
        return MatrixEmbed
    }

    getTotal(building) {
        let amount = 0
        for (const Cell of this) {
            if (Cell.value == building) amount++
        }
        if (amount > 30) throw "Something seems to be either broken or corrupted, please contact my creator (**Felix44#0073**)"
        return amount
    }
}

exports.ClashMatrix = ClashMatrix

Clash = {
    names: {
        N: "Empty Tile",
        T: "Town Hall",
        M: "DogeCoin Mine",
        C: "Cannon",
        X: "Crossbow",
        B: "Barracks"
    },
    emojis: {
        N: ":black_large_square:",
        T: "<:townhall:919125796868743210>",
        M: "<:mine:919125796889722890>",
        C: "<:cannon:919125796793241680>",
        X: "<:crossbow:919125796830978088>",
        B: "<:barracks:920442549796237403>"
    },
    buildings: {
        "mine": "M",
        "dogecoin mine": "M",
        "cannon": "C",
        "x-bow": "X",
        "x bow": "X",
        "crossbow": "X",
        "cross bow": "X",
        "barracks": "B",
        "barrack": "B"
    },
    help:
        "`&clash show [@user]` shows your/the pinged user's village\n" +
        "`&clash buildings` shows a list of all buildings and what they do\n" +
        "`&clash build (name) (x) (y)` places the desired building in the given location\n" +
        "`&clash cashin` collects all the money your mines did\n" +
        "`&clash move (x start) (y start) (x end) (y end)` swaps 2 buildings\n" +
        "`&clash remove` shows you a menu to remove buildings" +
        "`&clash attack (@user) (power) (x)` attacks the pinged user at the given x\n" +
        "the attack will target the southest building in the given x\n" +
        "the more power the attack is the more it can survive the defenses\n" +
        "but more power requires more barracks and more money"
}

Commands.clash = new Command("Build your village and attack other's!\n\n" + Clash.help, (message, args) => {
    const command = args[0].toLowerCase()
    switch (command) {
        case "show": {
            const EconomySystem = Economy.getEconomySystem(message.mentions.users.first() || message.author)
            const ClashMatrix = EconomySystem.clash
            message.channel.send({ embeds: [ClashMatrix.toEmbed(EconomySystem) ]})
            break
        }
        case "build": {
            if (!args[1]) {
                message.channel.send("Uh-huh, I'll build your \" \" immediately.")
                return
            }
            const EconomySystem = Economy.getEconomySystem(message.author)
            const ClashMatrix = EconomySystem.clash
            const building = Clash.buildings[args[1].toLowerCase()]
            if (!building) {
                message.channel.send("I have no clue what a " + args[1] + " is.\nIf you have no clue what you can build either, try `&clash buildings`".replace(/\&/g, Prefix.get(message.guild.id)))
            }
            const total = ClashMatrix.getTotal(building)
            if (total == 30) {message.channel.send("You already build 30 of these, you can't build more"); return}
            const x = parseInt(args[2])
            const y = parseInt(args[3])
            if (isNaN(x) || isNaN(y)) {
                message.channel.send("Now that position you just gave me...it doesn't make sense")
                return
            }
            if (!ClashMatrix.checkBounds(x, y)) {
                message.channel.send("Now that position you just told me...it's out of bounds")
                return
            }
            const price = 500 * EconomySystem.rank
            if (EconomySystem.buy(price, message, "Sucessfully built your " + args[1], "You lack money for this building, you need " + price)) {
                ClashMatrix.set(x, y, building)
                if (building == "M") EconomySystem.clashtime = Date.now()
            }
            break
        }
        case "move": {
            const xStart = parseInt(args[1])
            const yStart = parseInt(args[2])
            const xEnd = parseInt(args[3])
            const yEnd = parseInt(args[4])
            if ([xStart, yStart, xEnd, yEnd].some(Number.isNaN)) {
                message.channel.send("Now these positions you just gave me...they don't make sense")
                return
            }
            const EconomySystem = Economy.getEconomySystem(message.author)
            const ClashMatrix = EconomySystem.clash
            if (!ClashMatrix.checkBounds(xStart, yStart) || !ClashMatrix.checkBounds(xEnd, yEnd)) {
                message.channel.send("Now these positions you just gave me...they are out of bounds")
                return
            }
            const [B1, B2] = [ClashMatrix.at(xStart, yStart), ClashMatrix.at(xEnd, yEnd)]
            ClashMatrix.set(xEnd, yEnd, B1)
            ClashMatrix.set(xStart, yStart, B2)
            break
        }
        case "cashin": {
            const EconomySystem = Economy.getEconomySystem(message.author)
            const ClashMatrix = EconomySystem.clash
            const mines = ClashMatrix.getTotal("M")
            const seconds = Math.floor((Date.now() - EconomySystem.clashtime) / 1000)
            EconomySystem.give(Math.min(mines * seconds, mines * 10000), message)
            EconomySystem.clashtime = Date.now()
            break
        }
        case "buildings": {
            const EconomySystem = Economy.getEconomySystem(message.author)
            const InfoEmbed = new Discord.MessageEmbed()
                .setColor("#FFA500")
                .setTitle("Buildings")
                .setDescription(`Every building costs ${500 * EconomySystem.rank} to build and you can only have 30 of every building\nexcept the town hall, there is and must always be one for every village`)
                .addFields(
                    {
                        name: "Town Hall",
                        value: "an attacker will steal all the DogeCoins in your mines if you don't protect it!",
                        inline: true
                    },
                    {
                        name: "DogeCoin Mine",
                        value: "somehow extracts DogeCoins from underground, protect it from attackers!",
                        inline: true
                    },
                    {
                        name: "Cannon",
                        value: "powerful defense, can only shoot downwards",
                        inline: true
                    },
                    {
                        name: "CrossBow",
                        value: "not as powerful as a cannon, but can shoot everywhere",
                        inline: true
                    },
                    {
                        name: "Barracks",
                        value: "increases the max power you can use in an attack by 3",
                        inline: true
                    }
                )
            message.channel.send({ embeds: [InfoEmbed] })
            return
        }

        case 'remove': {
        const villageMatrix = Economy.getEconomySystem(message.author).clash;
          const selected = new Set();

          message.channel.send({
            content: 'Selected:\n\n`nothing`',
            components: [
              ...[...villageMatrix]
                .reduce((chunks, cell) => {
                  let index = 0
                  if (cell.value === "N" || cell.value === "T") return chunks;
                  const chunkIndex = Math.floor(index / 25);
                  index++;
                  (chunks[chunkIndex] ??= []).push(cell);

                  return chunks;
                }, [])
                .map((cells, chunkIndex) => {
                  return new Discord.MessageActionRow({
                    components: [
                      new Discord.MessageSelectMenu({
                        customId: 'remove-select-menu#' + chunkIndex,
                        placeholder: 'Choose which building to remove',
                        maxValues: cells.length,
                        options: cells.map(({value, x, y}) => ({
                          label: Clash.names[value],
                          description: `${x}, ${y}`,
                          value: `${value}-${x}-${y}`
                          }))
                      })
                    ]
                  });
                }),

              new Discord.MessageActionRow({
                components: [
                  new Discord.MessageButton({
                    customId: 'selector-delete',
                    style: 'DANGER',
                    label: 'Delete',
                  }),
                ]
              }),
            ]
          })
            .then((selector) => {
              const collector = selector.createMessageComponentCollector({
                componentType: 'SELECT_MENU',
                async filter(interaction) {
                  const isSameUser = interaction.user.id === message.author.id;

                  if (!isSameUser) {
                    await interaction.reply({
                      content: "You can't delete someone else's building",
                      ephemeral: true
                    });
                  }

                  return isSameUser;
                }
              });

              collector.on('collect', async (interaction) => {
                for (const v of interaction.values) {
                  const [, rawX, rawY] = v.split('-');

                  if ([...selected].some(({ x: cellX, y: cellY }) => cellX === Number(rawX) && cellY === Number(rawY))) {
                    selected.delete([...selected].find(({ x: cellX, y: cellY }) => cellX === Number(rawX) && cellY === Number(rawY)));
                  } else {
                    selected.add(villageMatrix.getCell(Number(rawX), Number(rawY)));
                  }
                }


                  return void interaction.update({
                    content: 'Selected:\n\n' +
                      ([...selected].map((tile) => {
                        return `${Clash.emojis[tile.value]} (${tile.x}, ${tile.y})`;
                      }).join('\n') || '`nothing`')
                  });
              });

              return selector.awaitMessageComponent({
                componentType: 'BUTTON',
                async filter(interaction) {
                  const isSameUser = interaction.user.id === message.author.id;
                  const isSelected = selected.size !== 0;

                  if (!isSameUser) {
                    await interaction.reply({
                      content: "You can't delete someone else's alias",
                      ephemeral: true
                    });
                  }

                  if (!isSelected) {
                    await interaction.reply({
                      content: "Deleting nothing...",
                      ephemeral: true
                    });
                  } else collector.stop();

                  return isSameUser && isSelected;
                }
              });
            })
            .then((interaction) => {
              interaction.update({
                content: "Successfully removed " +
                  [...selected].map((tile) => {
                    return `${Clash.emojis[tile.value]} (${tile.x}, ${tile.y})`;
                  }).join(', ')
              })

              for (const cell of selected) {
                cell.value = 'N';
              }
            });
          break;
        }
        default: message.channel.send(Clash.help.replace(/\&/g, Prefix.get(message.guild.id)))
    }
}, "Game", [
    new RequiredArg(0, Clash.help, "command"),
    new RequiredArg(1, undefined, "arg 1", true),
    new RequiredArg(2, undefined, "arg 2", true),
    new RequiredArg(3, undefined, "arg 3", true),
    new RequiredArg(4, undefined, "arg 4", true)
])