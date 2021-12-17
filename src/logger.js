const { Command } = require("./command")
const fs = require('fs')
const path = require('path')

const colors = {
    white: "\033[97m",
    green: "\x1B[92m",
    red: "\x1B[31m",
    blue: "\x1B[34m",
    yellow: "\x1B[33m",
    purple: "\x1B[35m",
    cyan: "\x1B[36m",
    hblack: "\x1B[40m",
    hred: "\x1B[41m",
    hgreen: "\x1B[42m",
    hyellow: "\x1B[43m",
    hblue: "\x1B[44m",
    hpurple: "\x1B[45m",
    hcyan: "\x1B[46m",
    reset: ("\033[97m" + "\x1B[40m") // white + hblack
}

/**
 * @typedef {"white" | "green" | "red" | "blue" | "yellow" | "purple" | "cyan" | "hblack" | "hred" | "hgreen" | "hyellow" | "hblue" | "hpurple" | "hcyan"} Color
 * 
 */
class ColorMap {
    #baseText

    /**
     * @param {String} text
     */
    constructor(text) {
        this.#baseText = text
    }

    /**
     * Will swap startIndex and endIndex if endIndex is smaller than startIndex
     * @param {Color} color 
     * @param {Number} startIndex 
     * @param {Number} endIndex 
     * @returns {ColorMap} The current instance of ColorMap
     */
    colorRange(color, startIndex, endIndex) {
        if (!colors[color])
            throw "That color doesn't exist!"

        if (endIndex < startIndex) {
            let temp = startIndex
            startIndex = endIndex
            endIndex = temp
        }

        let coloredSubstring = colors[color] + this.#baseText.substring(startIndex, endIndex) + colors["reset"]

        let sections = [this.#baseText.slice(0, startIndex), coloredSubstring, this.#baseText.slice(endIndex)]

        this.#baseText = sections.join('')

        return this
    }

    /**
     * @returns {ColorMap}
     * @param {Color} color 
     * @param {Number} index 
     */
    colorFrom(color, index) {
        if (!colors[color])
            throw "That color doesn't exist!"

        let sections = [this.#baseText.slice(0, index), this.#baseText.slice(index)]

        this.#baseText = sections[0] + colors[color] + sections[1] + colors["white"] + colors["hblack"]

        return this
    }

    /**
     * @returns {ColorMap}
     * @param {Color} color 
     * @param {Number} index 
     */
    colorTo(color, index) {
        if (!colors[color])
            throw "That color doesn't exist!"

        let sections = [this.#baseText.slice(0, index), this.#baseText.slice(index)]

        this.#baseText = colors[color] + sections[0] + colors["white"] + colors["hblack"] + sections[1]

        return this
    }

    /**
     * 
     * @param {Color} color 
     * @returns {ColorMap} The current instance of ColorMap
     */
    colorAll(color) {
        if (!colors[color])
            throw "That color doesn't exist!"

        this.#baseText = colors[color] + this.#baseText + colors["white"] + colors["hblack"]

        return this
    }

    toString() {
        return this.#baseText
    }
}

const loggableEventColors = {
    "cmdSuccess": "green",
    "fsSuccess": "purple",
    "instanceCreationSuccess": "cyan",
    "warning": "yellow",
    "jsError": "red"
}

/**
 * @typedef {"cmdSuccess" | "fsSuccess" | "instanceCreationSuccess" | "warning" | "jsError" } LoggableEvent
 * @typedef {{logFolderPath: String, canLog: LoggableEvent[], useColors: boolean, useLogFile: boolean}} LoggerOptions
 * @type {LoggerOptions} 
 */
const defaultOptions = {
    useLogFile: true,
    logFolderPath: "src/data/logs/",
    canLog: ["cmdSuccess", "jsError", "warning"],
    useColors: true
}

class Logger {
    /**
     * @param {LoggerOptions} options 
     */
    constructor(options) {
        let opts = {}
        Object.assign(opts, defaultOptions) // sneaky lil method
        Object.assign(opts, options) // keep this order, so that defaultOptions can get overriden instead of the opposite 

        /**
         * @type {LoggerOptions}
         */
        this.options = opts
    }

    commandSuccess(text) {
        if (!this.canLog("cmdSuccess"))
            return
        this._write(text, "cmdSuccess")
    }

    fileSystemOperationSuccess(text) {
        if (!this.canLog("fsSuccess"))
            return
        this._write(text, "fsSuccess")
    }

    instanceCreationSuccess(text) {
        if (!this.canLog("instanceCreationSuccess"))
            return
        this._write(text, "instanceCreationSuccess")
    }

    warning(text) {
        if (!this.canLog("warning"))
            return

        this._write(text, "warning")
    }

    _write(text, event) {
        let baseLogText = `[${event}] ${text}`
        
        // console
        console.log(new ColorMap(baseLogText).colorRange(loggableEventColors[event], 1, event.length + 1).toString())

        // append to logfile
        if (this.options.useLogFile) {
            fs.appendFileSync(path.join(this.options.logFolderPath, Date.now()), baseLogText)
        }
    }

    /**
     * @param {LoggableEvent} logLevel 
     * @returns {boolean}
     */
    canLog(logLevel) {
        return (!this.options[logLevel] ? true : false)
    }
}

module.exports = {
    ColorMap,
    /**
     * @param {LoggerOptions} options
     */
    create(options) {
        const logger = new Logger(options)
        return logger
    }
}