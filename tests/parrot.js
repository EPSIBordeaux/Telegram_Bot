require('dotenv').config()
const { before, beforeEach, after, it, describe } = require('mocha')

const TelegramServer = require('telegram-test-api')
const Bot = require('../src/bot')
const messageHelper = require('../src/helper/test_message_helper')

let client, server, token, testBot

describe('Simple tests with keyword', function () {
  before(function (done) {
    token = process.env.TOKEN
    let serverConfig = {
      'port': 9000,
      'host': 'localhost',
      'storage': 'RAM',
      'storeTimeout': 60
    }
    server = new TelegramServer(serverConfig)

    server.start().then(() => {
      client = server.getClient(token, {timeout: 2000})
      let botOptions = { polling: true, baseApiUrl: server.ApiURL }
      testBot = new Bot(token, botOptions)

      messageHelper.init(client)
      done()
    })
  })

  beforeEach((done) => {
    messageHelper.newClient()
    done()
  })

  after(function (done) {
    testBot.stop()
    server.stop().then(() => done())
  })

  it('should do the parrot', function () {
    this.slow(2000)
    this.timeout(3000)

    return messageHelper.assert(`${process.env.TOKEN}say hello`, 'hello')
  })

  it('Should say hello', function () {
    this.slow(2000)
    this.timeout(3000)

    return messageHelper.assert(`${process.env.TOKEN}hello`, 'Bonjour !')
  })
})
