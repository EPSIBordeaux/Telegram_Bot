require('dotenv').config()
const expect = require('chai').expect

const { before, beforeEach, after, it, describe } = require('mocha')

const TelegramServer = require('telegram-test-api')
const Bot = require('../src/bot')
const messageHelper = require('../src/helper/test_message_helper')
const airbrake = require('../src/helper/airbrake')

airbrake.run()

let client, server, token, testBot

describe('Development Questions with keyword', function () {
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

  it('Should answer right to a boolean dev question so its score is equal to 1', function () {
    this.slow(2000)
    this.timeout(3000)

    return messageHelper.assert(`${process.env.TOKEN}devQuestion`, 'Voici une question de développement, êtes-vous prêt ? (oui/non)')
      .then(() => {
        messageHelper.setCustomDevQuestion(testBot, 1)
        return messageHelper.assert('oui', 'Le C est un language compilé. (vrai/faux)')
      })
      .then(() => messageHelper.assert('vrai', ['Très bien !', 'Prêt pour la question suivante ? (oui/non)']))
      .then(() => expect(messageHelper.getClientChatData(testBot).scoreDev).equal(1))
  })

  it('Should answer right to a eval dev question so its score is equal to 3', function () {
    this.slow(2000)
    this.timeout(3000)

    return messageHelper.assert(`${process.env.TOKEN}devQuestion`, 'Voici une question de développement, êtes-vous prêt ? (oui/non)')
      .then(() => {
        messageHelper.setCustomDevQuestion(testBot, 2)
        return messageHelper.assert('oui', 'Ecrivez une fonction qui inverse une chaine de charactère.\nLa valeur sera retournée à la fin de la fonction')
      })
      .then(() => messageHelper.assert("function a(my_string) {return my_string.split('').reverse().join('');}", ['Très bien !', 'Prêt pour la question suivante ? (oui/non)']))
      .then(() => expect(messageHelper.getClientChatData(testBot).scoreDev).equal(3))
  })

  it('Should answer wrong to 2 dev questions so its score is equal to 0', function () {
    this.slow(2000)
    this.timeout(3000)

    // We won't check the output because they are randomly asked. So we'll answer a dummy response.
    return messageHelper.assert(`${process.env.TOKEN}devQuestion`, 'Voici une question de développement, êtes-vous prêt ? (oui/non)')
      .then(() => messageHelper.assert('oui', '', { no_check: true }))
      .then(() => messageHelper.assert('Je ne répondrais pas !', ['Vous avez mal répondu.', 'Prêt pour la question suivante ? (oui/non)']))
      .then(() => messageHelper.assert('oui', '', { no_check: true }))
      .then(() => messageHelper.assert('Je ne répondrais pas !', ['Vous avez mal répondu.', 'Prêt pour la question suivante ? (oui/non)']))
      .then(() => expect(messageHelper.getClientChatData(testBot).scoreDev).equal(0))
  })

  it('Should answer right to a QCM dev question so its score is equal to 2', function () {
    this.slow(2000)
    this.timeout(3000)

    return messageHelper.assert(`${process.env.TOKEN}devQuestion`, 'Voici une question de développement, êtes-vous prêt ? (oui/non)')
      .then(() => {
        messageHelper.setCustomDevQuestion(testBot, 3)
        return messageHelper.assert('oui', "Lequel de ces framework n'est pas un framework PHP ?")
      })
      .then(() => messageHelper.assert('Meteor', ['Très bien !', 'Prêt pour la question suivante ? (oui/non)']))
      .then(() => expect(messageHelper.getClientChatData(testBot).scoreDev).equal(2))
  })
})
