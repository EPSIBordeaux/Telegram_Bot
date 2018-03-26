require('dotenv').config()
const expect = require('chai').expect

const { state } = require('../src/helper/variables')

const { before, beforeEach, after, it, describe } = require('mocha')

const TelegramServer = require('telegram-test-api')
const Bot = require('../src/bot')
const messageHelper = require('../src/helper/test_message_helper')
const airbrake = require('../src/helper/airbrake')

airbrake.run()

let client, server, token, testBot

describe('Misc tests', function () {
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

  it('Should reset the conversation', function () {
    this.slow(2000)
    this.timeout(3000)

    let expected = {
      current_state: state.none,
      queue: [],
      devQuestionCount: 0,
      networkQuestionCount: 0,
      currentQuestion: undefined,
      currentQuestionNetwork: undefined,
      scoreDev: 0,
      scoreNetwork: 0,
      answeredQuestions: [],
      answeredNetworkQuestions: []
    }

    return messageHelper.assert('recommencer', "Recommençons ! Tapez 'start' pour commencer")
      .then(() => expect(messageHelper.getClientChatData(testBot)).deep.equal(expected))
  })

  it('Should reset the conversation at any time.', function () {
    this.slow(2000)
    this.timeout(3000)

    let expected = {
      current_state: state.none,
      queue: [],
      devQuestionCount: 0,
      networkQuestionCount: 0,
      currentQuestion: undefined,
      currentQuestionNetwork: undefined,
      scoreDev: 0,
      scoreNetwork: 0,
      answeredQuestions: [],
      answeredNetworkQuestions: []
    }

    return messageHelper.assert('/start', 'Bonjour !\nJe me présente, je suis un petit bot de recrutement.\nSi vous le souhaitez, je vais vous poser quelques questions afin de voir quel poste pourrait vous convenir. Êtes-vous prêt ?')
      .then(() => messageHelper.assert('oui', ['Parfait, commençons !', 'Voici une question de développement, êtes-vous prêt ? (oui/non)']))
      .then(() => messageHelper.assert('Je veux recommencer', "Recommençons ! Tapez 'start' pour commencer"))
      .then(() => expect(messageHelper.getClientChatData(testBot)).deep.equal(expected))
  })
})
