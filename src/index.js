require('dotenv').config()

const MyChatBot = require('./bot')
const airbrake = require('./helper/airbrake')

const token = process.env.TOKEN
const options = {
  polling: true
}

const bot = new MyChatBot(token, options)
console.log(bot.options)

airbrake.run()
