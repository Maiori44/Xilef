const { LocalClient } = require('./structures/client.js')
const { Intents } = require('discord.js')

const client = new LocalClient(
    [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ]
)

client.start(client.debugging ? process.env.DEBUG : process.env.TOKEN)
