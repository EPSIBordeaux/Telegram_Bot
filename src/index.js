require('dotenv').config()

const isProd = process.env.NODE_ENV === 'production'

const MyChatBot = require('./bot')

const token = process.env.TOKEN
const options = {
  polling: isProd
}

if (isProd) {
  const express = require('express')
  const bodyParser = require('body-parser')
  const app = express()
  app.use(bodyParser.json())
  app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body)
    res.sendStatus(200)
  })
  app.listen(process.env.PORT, '127.0.0.1', () => {
    console.log(`Express server is listening on ${process.env.PORT}`)
  })
}

const bot = new MyChatBot(token, options)
console.log(bot.options)
