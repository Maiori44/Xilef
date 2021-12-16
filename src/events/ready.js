const { Event } = require('../event.js')

module.exports = new Event("ready", client => {
    console.log('ready!')
})