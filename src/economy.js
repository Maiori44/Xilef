const rawData = require('./data/economy.json')
const { Collection } = require('discord.js')

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
    /**
     * @typedef {{discordId: Number, balance: Balance, driller: Number}} UserOptions
     * @param {UserOptions} options 
     */
    constructor(options) {
        this.discordId = options.discordId
        this.balance = options.balance || new Balance()
    }
    
    /**
     * 
     * @param {String} valueName 
     * @param {String} newValue
     * @throws An error if valueName is not a key in XilefUser.
     */
    changeValue(valueName, newValue) {
        if (!this[valueName])
            throw new valueName + "is not an existent key of XilefUser."

        
        this[valueName] = newValue
    }

    /**
     * @returns {String}
     */
    registerChanges() {

    }
}
module.exports = {
    XilefUser,
    Balance
}

