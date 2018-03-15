require('dotenv').config()

const MyChatBot = require('./bot')
const AirbrakeClient = require('airbrake-js')

const token = process.env.TOKEN
const options = {
  polling: true
}

const bot = new MyChatBot(token, options)
console.log(bot.options)

if (process.env.CIRCLECI === undefined) {
  var airbrake = new AirbrakeClient({
    projectId: process.env.PROJECT_ID,
    projectKey: process.env.PROJECT_KEY
  })

  airbrake.addFilter(function (notice) {
    notice.context.environment = process.env.NODE_ENV
    return notice
  })
}
