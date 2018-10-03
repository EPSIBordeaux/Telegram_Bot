require('dotenv').config()
const expect = require('chai').expect

const { before, beforeEach, after, it, describe } = require('mocha')

const TelegramServer = require('telegram-test-api')
const Bot = require('../src/bot')
const messageHelper = require('../src/helper/test_message_helper')

let client, server, token, testBot

describe('Onboarding', function () {
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
      client = server.getClient(token, { timeout: 2000 })
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

  it('Should make an onboarding question to the user', function () {
    this.slow(2000)
    this.timeout(3000)

    return messageHelper.assert('/start', 'Bonjour !\nJe me présente, je suis un petit bot de recrutement.\nSi vous le souhaitez, je vais vous poser quelques questions afin de voir quel poste pourrait vous convenir. Êtes-vous prêt ?')
      .then(() => messageHelper.assert('oui', ['Parfait, commençons !', 'Voici une question de développement, êtes-vous prêt ? (oui/non)']))
  })

  it("Should make an onboarding question to the user but the user doesn't want to start", function () {
    this.slow(2000)
    this.timeout(3000)

    return messageHelper.assert('/start', 'Bonjour !\nJe me présente, je suis un petit bot de recrutement.\nSi vous le souhaitez, je vais vous poser quelques questions afin de voir quel poste pourrait vous convenir. Êtes-vous prêt ?')
      .then(() => messageHelper.assert('non', "Très bien, dites moi 'oui' quand vous serez prêt !"))
      .then(() => expect(messageHelper.getClientChatData(testBot).current_state).equal(messageHelper.getStates().onBoarding.asked))
  })
})
