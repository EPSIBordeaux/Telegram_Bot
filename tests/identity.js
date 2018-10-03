require('dotenv').config()
const { before, beforeEach, after, it, describe } = require('mocha')

const TelegramServer = require('telegram-test-api')
const Bot = require('../src/bot')
const messageHelper = require('../src/helper/test_message_helper')

let client, server, token, testBot

describe('Identity tests with keyword', function () {
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

  it('should ask firstname and name', function () {
    this.slow(2000)
    this.timeout(3000)

    return messageHelper.assert(`${process.env.TOKEN}identity`, 'Quel est votre nom ?')
      .then(() => messageHelper.assert('Dupont', "Votre nom est 'Dupont'. Est-ce correct ? (oui/non)"))
      .then(() => messageHelper.assert('oui', 'Très bien, quel est votre prénom ?'))
      .then(() => messageHelper.assert('Jean', "Votre prénom est 'Jean'. Est-ce correct ? (oui/non)"))
      .then(() => messageHelper.assert('oui', 'Très bien, quel est votre email ?'))
  })

  it('Should ask firstname, name and a valid email', function () {
    this.slow(2000)
    this.timeout(3000)

    return messageHelper.assert(`${process.env.TOKEN}identity`, 'Quel est votre nom ?')
      .then(() => messageHelper.assert('Dupont', "Votre nom est 'Dupont'. Est-ce correct ? (oui/non)"))
      .then(() => messageHelper.assert('oui', 'Très bien, quel est votre prénom ?'))
      .then(() => messageHelper.assert('Jean', "Votre prénom est 'Jean'. Est-ce correct ? (oui/non)"))
      .then(() => messageHelper.assert('oui', 'Très bien, quel est votre email ?'))
      .then(() => messageHelper.assert('test@test.fr', "Votre email est 'test@test.fr'. Est-ce correct ? (oui/non)"))
      .then(() => messageHelper.assert('oui', ['Parfait !', "Je vous remercie d'avoir utilisé notre plateforme de recrutement et vous souhaite une agréable journée"]))
  })

  it('Should ask name, firstname and an invalid email', function () {
    this.slow(2000)
    this.timeout(3000)

    return messageHelper.assert(`${process.env.TOKEN}identity`, 'Quel est votre nom ?')
      .then(() => messageHelper.assert('Dupont', "Votre nom est 'Dupont'. Est-ce correct ? (oui/non)"))
      .then(() => messageHelper.assert('oui', 'Très bien, quel est votre prénom ?'))
      .then(() => messageHelper.assert('Jean', "Votre prénom est 'Jean'. Est-ce correct ? (oui/non)"))
      .then(() => messageHelper.assert('oui', 'Très bien, quel est votre email ?'))
      .then(() => messageHelper.assert('test invalid test.fr', 'Votre email est invalide, merci de le saisir à nouveau'))
  })
})
