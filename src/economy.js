const { Collection } = require('discord.js')
const { Logger } = require('./logger.js')
const fs = require('fs')
const BSON = require('bson')
const saveFilePath = './src/data/economy.bson'

class Balance {
    /**
     * @type {Number}
     */
    #value

    constructor() {
        this.#value = 0
    }

    getValue() { return this.#value }

    /**
     * 
     * @param {Number} amount The amount to add to the balance
     */
    add(amount) {
        this.#value += amount
    }

    /**
     * 
     * @param {Number} amount The amount to remove from the balance
     */
    remove(amount) {
        this.#value -= amount
        if (this.#value < 0)
            this.#value = 0
    }
}

class XilefUser {
    constructor(options) {
        // check if options has these keys (below)
        const requiredKeys = ["money", "rank"]
        requiredKeys.booleanCorrespondent = requiredKeys.map(() => false)

        Object.keys(options).forEach((key, index) => {
            if (options[key] && requiredKeys.includes(key))
                requiredKeys.booleanCorrespondent[index] = true
        })
        
        if (requiredKeys.booleanCorrespondent.find(b => b == false))
            throw new Error("Required key of XilefUser not found.")
            // if every element of requireKeys matches with a key of the options param, then it won't throw an error
            // this allows to expand the list of required keys without too much work in case the bot grows bigger whilst also keeping the code somewhat clean (better than `if (!options.money)`... for each key we wanna check)

        this.money = options.money
        this.rank = options.rank
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

        this.createUser("852882606629847050", new XilefUser({
            money: -1,
            rank: -1
        }))

        this.updateBson()
        this.loadBson()
    }

    loadBson() {
        const rawFileContents = fs.readFileSync(saveFilePath)

        const deserialized = BSON.deserialize(rawFileContents)

        Object.keys(deserialized).forEach(key => {
            this.#users.set(key, deserialized[key])
        })

        this.logger.fileSystemOperationSuccess("Successfully loaded economy from economy.bson")
    }

    updateBson() {
        fs.writeFileSync(saveFilePath, BSON.serialize(this.#users, { ignoreUndefined: false }))

        this.logger.fileSystemOperationSuccess("Successfully saved entire economy to economy.bson")
    }

    getUser(discordId) {
        return this.#users.get(discordId)
    }

    changeUser(discordId, xilefUser) {
        this.#users.set(discordId, xilefUser)
    }

    createUser(discordId, xilefUser) {
        if (this.#users.get(discordId, xilefUser))
            return

        this.#users.set(discordId, xilefUser)
        this.logger.instanceCreationSuccess(`Created a new instance of a user: \n<${discordId}> {\n ${JSON.stringify({xilefUser})} \n}\n`)
    }
}

module.exports = {
    Balance,
    EconomySystem,
    XilefUser
}

