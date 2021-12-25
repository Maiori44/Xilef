const { Collection } = require('discord.js')
const { economyLogger } = require('./constants.js')
const fs = require('fs')
const BSON = require('bson')
const saveFilePath = './src/data/economy.bson'

class UserBinaryData {
    /**
     * 
     * @param {String} binary The binary read from the JSON
     */
    constructor(totalFlags, binary) {
        /**
         * @type {String}
         */
        this.binary = binary ? binary : "0"
        this.totalFlags = totalFlags
    }

    getBinary() {
        return this.binary
    }

    /**
     * Will set the bit at `position` (set to 1)
     * @param {Number} position 
     */
    setflagAt(position) {
        let binaryNumber = parseInt(this.binary, 2)
        binaryNumber |= (1 << position) // cool operator i found
        this.binary = binaryNumber.toString(2)
    }

    /**
     * Will clear the bit at `position` (set to 0)
     * @param {Number} position 
     */
    clearFlagAt(position) {
        let binaryNumber = parseInt(this.binary, 2)
        binaryNumber &= ~(Number(1) << Number(position))
        this.binary = binaryNumber.toString(2)
    }

    /**
     * 
     * @param {Number} position 
     * @returns {boolean}
     */
    isFlagSet(position) {
        return ((parseInt(this.binary, 2) >> position) & 1) == 1
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

        let bits = ("0".repeat(this.totalFlags - this.binary.length) + this.binary).split('')

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

class XilefUserData {
    constructor(options) {
        const optionsKeys = Object.keys(options)
        if (
            !optionsKeys.includes("money") ||
            !optionsKeys.includes("rank")
        )
            throw new Error("Missing required key of XilefUserData")

        this.money = options.money
        this.rank = options.rank

        this.vgot = new UserBinaryData(60, options.vgot.binary ?? "0")

        this.achievements = new UserBinaryData(9, options.achievements.binary ?? "0")
    }

    static getEmptyUser() {
        return new XilefUserData({
            money: 0,
            rank: 0,
            vgot: new UserBinaryData(60, "0"),
            achievements: new UserBinaryData(9, "0")
        })
    }
}

class EconomySystem {
    /**
     * @type {Collection<String, XilefUserData>}
     */
    #users

    constructor() {
        this.#users = new Collection()

        this.setUser("830008177156292609", new XilefUserData({
            money: -1,
            rank: -1,
            vgot: new UserBinaryData(60, "1".repeat(60)),
            achievements: new UserBinaryData(9, "1".repeat(9))
        }))

        try {
            this.#loadBson()
        } catch {
            economyLogger.error("Failed to load BSON " + saveFilePath)
        }
    }

    #loadBson() {
        const rawFileContents = fs.readFileSync(saveFilePath)

        const deserialized = BSON.deserialize(rawFileContents)

        Object.keys(deserialized).forEach(key => {
            const rawUserData = deserialized[key]

            const userCreationOptions = {}
            Object.assign(userCreationOptions, rawUserData)

            this.#users.set(key, new XilefUserData(userCreationOptions))
            economyLogger.log(`Loaded <${key}> from economy.bson \n(${JSON.stringify(userCreationOptions)})`)
        })

        economyLogger.info("successfully loaded entire economy from economy.bson")
    }

    #updateBson() {
        fs.writeFileSync(saveFilePath, BSON.serialize(this.#users, { ignoreUndefined: false }))

        economyLogger.info("successfully saved entire economy to economy.bson")
    }

    /**
     * 
     * @param {String} discordId 
     * @returns Gets a user or creates it if it does not exist
     */
    getUser(discordId) {
        if (!this.#users.get(discordId) && typeof discordId == "string") {
            this.setUser(discordId, XilefUserData.getEmptyUser())
        }
        return this.#users.get(discordId)
    }

    setUser(discordId, xilefUser) {
        if (!this.#users.get(discordId)) {
            economyLogger.log(`sreated a new instance of a user: \n<${discordId}> {\n ${JSON.stringify({ xilefUser })} \n}\n`)
        }

        this.#users.set(discordId, xilefUser)

        this.#updateBson()
    }
}

module.exports = {
    EconomySystem,
    XilefUser: XilefUserData
}

