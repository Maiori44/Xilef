const { Collection } = require('discord.js')
const { Logger } = require('./logger.js')
const fs = require('fs')
const BSON = require('bson')
const saveFilePath = './src/data/economy.bson'

class UserBinaryData {
    /**
     * 
     * @param {String} binary The binary read from the JSON
     */
    constructor(binary) {
        /**
         * @type {Number}
         */
        this.binary = binary ? Number(binary) : Number(0)
    }

    getBinary() {
        return this.binary.toString(2)
    }

    /**
     * Will set the bit at `position` (set to 1)
     * @param {Number} position 
     */
    setflagAt(position) { 
        this.binary |= 1 << position // cool operator i found
    }

    /**
     * Will clear the bit at `position` (set to 0)
     * @param {Number} position 
     */
    clearFlagAt(position) {
        this.binary &= ~(1 << position)
    }

    /**
     * 
     * @param {Number} position 
     * @returns {boolean}
     */
    isFlagSet(position) {
        return ((this.binary >> position) & 1) == 1
    }

    getFormattedBinary(replace1, replace0) {
        replace1 = replace1 || []
        replace1.reverse()
        let bits = [...this.binary.toString(2).padStart(this.totalflags, "0")]
        bits.forEach((bit, position) => {
            if (bit == "1") {
                bits[position] = replace1[position] || "1"
            } else {
                bits[position] = replace0 || "0"
            }
        })
        replace1.reverse()
        return bits.join("")
    }
}

class XilefUser {
    constructor(options) {
        const optionsKeys = Object.keys(options)
        if (
            !optionsKeys.includes("money") ||
            !optionsKeys.includes("rank")
        )
            throw new Error("Missing required key of XilefUser")

        this.money = options.money
        this.rank = options.rank

        this.vgot = new UserBinaryData(options.vgot.binary || "0")
    }
}

/**
 * @typedef {{logger: Logger}} EconomySystemOptions
 */
class EconomySystem {
    /**
     * @type {Collection<String, XilefUser>}
     */
    #users

    /**
     * 
     * @param {EconomySystemOptions} options 
     */
    constructor(options) {
        this.logger = options.logger
        this.#users = new Collection()

        try {
            this.#loadBson()
        } catch {
            this.setUser("852882606629847050", new XilefUser({
                money: -1,
                rank: -1,
                vgot: new UserBinaryData("10313")
            }))
        }
    }

    #loadBson() {
        const rawFileContents = fs.readFileSync(saveFilePath)

        const deserialized = BSON.deserialize(rawFileContents)

        Object.keys(deserialized).forEach(key => {
            const rawUserData = deserialized[key]

            const userCreationOptions = {}
            Object.assign(userCreationOptions, rawUserData)
            
            this.#users.set(key, new XilefUser(userCreationOptions))
            this.logger.fileSystemOperationSuccess(`Loaded <${key}>from economy.bson \n(${JSON.stringify(userCreationOptions)})`)
        })

        this.logger.fileSystemOperationSuccess("Successfully loaded entire economy from economy.bson")
    }

    #updateBson() {
        fs.writeFileSync(saveFilePath, BSON.serialize(this.#users, { ignoreUndefined: false }))

        this.logger.fileSystemOperationSuccess("Successfully saved entire economy to economy.bson")
    }

    getUser(discordId) {
        return this.#users.get(discordId)
    }

    setUser(discordId, xilefUser) {
        const user = this.#users.get(discordId)
        if (!user) {
            this.logger.instanceCreationSuccess(`Created a new instance of a user: \n<${discordId}> {\n ${JSON.stringify({ xilefUser })} \n}\n`)
        }

        this.#users.set(discordId, xilefUser)

        this.#updateBson()
    }
}

module.exports = {
    EconomySystem,
    XilefUser
}

