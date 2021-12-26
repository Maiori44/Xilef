require('dotenv').config()

const { parsedValues } = require('../parser.js')
const { Collection, User } = require('discord.js')
const { economyLogger } = require('../constants.js')
const fs = require('fs')
const BSON = require('bson')

const saveFilePath = parsedValues.saveFilePath
let maxChangeCount = parsedValues.serializeAfter

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

class XilefUser {
    #update

    /**
     * 
     * @param {String | User} user 
     * @param {XilefUserData} userData 
     * @param {{}} options
     */
    constructor(user, userData, options) {
        if (!userData || !userData instanceof XilefUserData)
            throw "XilefUser instance creation needs valid user data."

        if (typeof user != 'string' && !user instanceof User)
            throw "Argument 'user' is neither a User or string."
        
        const userDataProxyHandler = {
            get: function(target, prop, receiver) {
                return target[prop]
            }.bind(this),

            set: function(target, prop, value) {
                maxChangeCount--
                economyLogger.debug("Changed property '%s' of XilefUserData instance (belongs to %s) from %s to %s. New maxChangeCount : " + maxChangeCount, prop, this.user.id ?? this.user, target[prop], value)
                this.#update()
                target[prop] = value
                return true
            }.bind(this)
        }

        this.user = user
        this.data = new Proxy(userData, userDataProxyHandler)
        this.#update = options.update // currently, this is the safest way i found
    }

    /**
     * 
     * @param {Number} amount 
     * @param {(success: success, errMsg?: String) => void} callback
     */
    buy(amount, callback) {
        let success = true
        let errMsg = ""

        if (amount < 1) {
            success = false
            errMsg = "Amount too low."
        } else if (this.data.money <= amount) {
            success = false
            errMsg = `Not enough money (balance: ${this.data.money}; amount: ${amount})`
        }

        if (success) {
            this.data.money -= amount
            economyLogger.debug("success(purchase): successfully bought %s DogeCoins as user '%s'", amount.toString(), this.user.tag)
        } else {
            economyLogger.debug("failure(purchase): couldn't buy with %s DogeCoins as user '%s'; error message: %s ", amount.toString(), this.user.tag, errMsg)
        }

        if (typeof callback == 'function')
            callback(success, errMsg)
    }

    /**
     * 
     * @param {Number} amount 
     * @param {(newAmount: Number, oldAmount: Number) => void)} callback 
     */
    take(amount, callback) {
        this.data.money = Math.max(this.data.money - amount, 0)

        economyLogger.debug("success(theft): successfully took %s DogeCoins from '%s'", amount.toString(), this.user.tag)

        if (typeof callback == 'function')
            callback()
    }

    /**
     * 
     * @param {Number} amount 
     * @param {(success: success, errMsg:? String) => void} callback 
     */
    give(amount, callback) {
        let success = true
        let errMsg = ""

        if (isNaN(parseInt(amount))) {
            success = false
            errMsg = `Arg 'amount' isn't a number (specified amount : ${amount})`
        } else if (amount <= 0) {
            success = false
            errMsg = `Can't give 0 or less coins (amount: ${amount})`
        }

        if (success) {
            this.data.money += amount
            economyLogger.debug("success(gift): successfully gave %s DogeCoins to user '%s'", amount.toString(), this.user.tag ?? this.user)
        } else {
            economyLogger.debug("failure(gift): couldn't give amount %s to user '%s'; error message: %s ", amount.toString(), this.user.tag, errMsg)
        }

        if (typeof callback == 'function')
            callback(success, errMsg)
    }
}

class EconomySystem {
    /**
     * @type {Collection<String, XilefUserData>}
     */
    #users

    constructor() {
        this.#users = new Collection()

        // create backup of economy.bson
        fs.copyFileSync(saveFilePath, './src/data/backups/_economy.bson')

        this.#users.set("830008177156292609", new XilefUserData({
            money: -1,
            rank: -1,
            vgot: new UserBinaryData(60, "1".repeat(60)),
            achievements: new UserBinaryData(9, "1".repeat(9))
        }))


        this.#loadBson()
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
        if (maxChangeCount >= 1) return

        fs.writeFileSync(saveFilePath, BSON.serialize(this.#users, { ignoreUndefined: false }))

        economyLogger.info("successfully saved entire economy to economy.bson")

        maxChangeCount = parsedValues.serializeAfter
    }

    /**
     * 
     * @param {String | User} user 
     * @returns Gets a user or creates it if it does not exist
     */
    getUser(user) {
        if (typeof user == 'string' && !this.#users.get(user))
            this.setUser(user, XilefUserData.getEmptyUser())

        else if (user instanceof User && !this.#users.get(user.id))
            this.setUser(user.id, XilefUserData.getEmptyUser())

        return new XilefUser(user, this.#users.get(user.id ?? user), { update: this.#updateBson.bind(this, null), maxChangeCount: this.maxChangeCount })
    }

    setUser(discordId, xilefUserData) {
        if (!xilefUserData instanceof XilefUserData)
            throw "You need to set a valid XilefUserData instance"

        if (!this.#users.get(discordId)) {
            economyLogger.log(`created a new instance of a user: <${discordId}>`)
        }

        this.#users.set(discordId, xilefUser)

        this.#updateBson()
    }
}

module.exports = {
    EconomySystem,
    XilefUser,
    XilefUserData,
    UserBinaryData
}

