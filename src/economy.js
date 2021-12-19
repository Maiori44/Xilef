const { Collection } = require('discord.js')
const { Logger } = require('./logger.js')
const fs = require('fs')
const BSON = require('bson')
const saveFilePath = './src/data/economy.bson'

const Long = BSON.Long

class UserBinaryData {
    /**
     * 
     * @param {String} binary The binary read from the JSON
     */
    constructor(totalFlags, binary) {
        /**
         * @type {Long}
         */
        this.binary = binary ? Long(binary) : Long(0)
        this.totalFlags = totalFlags
    }

    getBinary() {
        return this.binary.toString(2)
    }

    /**
     * Will set the bit at `position` (set to 1)
     * @param {Long} position 
     */
    setflagAt(position) {
        this.binary |= Long(1) << Long(position) // cool operator i found
    }

    /**
     * Will clear the bit at `position` (set to 0)
     * @param {Long} position 
     */
    clearFlagAt(position) {
        this.binary &= ~(Long(1) << Long(position))
    }

    /**
     * 
     * @param {Number} position 
     * @returns {boolean}
     */
    isFlagSet(position) {
        return ((this.binary >> position) & 1) == 1
    }

    /**
     * 
     * @param {Array<String>} replace1 
     * @param {String} replace0 
     * @returns {String}
     */
    getFormattedBinary(replace1, replace0) {
        replace1 = replace1 || []
        replace1.reverse()

        const binaryString = this.binary.toString(2)
        let bits = ("0".repeat(this.totalFlags - binaryString.length) + binaryString).split('')

        for (let i = 0; i < bits.length; i++) {
            if (bits[i] == "0")
                bits[i] = replace0
            else
                bits[i] = replace1[i]
        }

        replace1.reverse()

        return bits.join('')
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

        this.vgot = new UserBinaryData(60, options.vgot.binary ?? "0")

        this.achievements = new UserBinaryData(9, options.achievements.binary ?? "0")
    }

    static getEmptyUser() {
        return new XilefUser({
            money: 0,
            rank: 0,
            vgot: new UserBinaryData(60, "0"),
            achievements: new UserBinaryData(9, "0")
        })
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
            this.logger.warning("Creating XDT Framework user due to no data fetched from " + saveFilePath)
            this.setUser("830008177156292609", new XilefUser({
                money: -1,
                rank: -1,
                vgot: new UserBinaryData(60, "1111"),
                achievements: new UserBinaryData(9, "1111111")
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
            this.logger.fileSystemOperationSuccess(`Loaded <${key}> from economy.bson \n(${JSON.stringify(userCreationOptions)})`)
        })

        this.logger.fileSystemOperationSuccess("Successfully loaded entire economy from economy.bson")
    }

    #updateBson() {
        fs.writeFileSync(saveFilePath, BSON.serialize(this.#users, { ignoreUndefined: false }))

        this.logger.fileSystemOperationSuccess("Successfully saved entire economy to economy.bson")
    }

    /**
     * 
     * @param {String} discordId 
     * @returns Gets a user or creates it if it does not exist
     */
    getUser(discordId) {
        if (!this.#users.get(discordId) && typeof discordId == "string") {
            this.setUser(discordId, XilefUser.getEmptyUser())
        }
        return this.#users.get(discordId)
    }

    setUser(discordId, xilefUser) {
        if (!this.#users.get(discordId)) {
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

