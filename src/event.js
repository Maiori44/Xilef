/** @format */

const Discord = require("discord.js");

const { LocalClient } = require('./client.js')

/**
 * @template {keyof Discord.ClientEvents} K
 */
class Event {
	/**
	 * @param {K} event
	 * @param {(client: LocalClient, ...eventArgs: Discord.ClientEvents[K]) => Promise<void>} runFunction
	 */
	constructor(event, runFunction) {
		this.event = event;
		this.run = runFunction;
	}
}

module.exports = {
	Event
} 