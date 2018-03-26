require('dotenv').config()
const expect = require('chai').expect

const { before, beforeEach, after, it, describe } = require('mocha')

const TelegramServer = require('telegram-test-api')
const Bot = require('../src/bot')
const messageHelper = require('../src/helper/test_message_helper')
const airbrake = require('../src/helper/airbrake')

airbrake.run()

let client, server, token, testBot

describe('Network Questions with keyword', function () {
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

  it('Should answer wrong to all network questions so its score is equal to 0', function () {
    this.slow(2000)
    this.timeout(3000)

    return messageHelper.assert(`${process.env.TOKEN}networkQuestion`, 'Voici une question de réseau, êtes-vous prêt ? (oui/non)')
      .then(() => messageHelper.assert('oui', '', { no_check: true }))
      .then(() => messageHelper.assert('Je ne répondrais pas !', ['Vous avez mal répondu.', 'Prêt pour la question suivante ? (oui/non)']))
      .then(() => messageHelper.assert('oui', '', { no_check: true }))
      .then(() => messageHelper.assert('Je ne répondrais pas !', ['Vous avez mal répondu.', 'Les questions de réseau sont maintenant terminées.', 'Je vais désormais calculer vos résultats..', "Malheureusement, aucun poste n'est actuellement disponible pour votre profil.\nVoulez-vous nous laisser vos coordonnées afin que nous puissions vous recontacter lorsque nous aurons des offres correspondant à votre profil ?"]))
      .then(() => expect(messageHelper.getClientChatData(testBot).scoreNetwork).equal(0))
  })

  it('Should answer right to all network questions so its score is equal to 3', function () {
    this.slow(2000)
    this.timeout(3000)

    return messageHelper.assert(`${process.env.TOKEN}networkQuestion`, 'Voici une question de réseau, êtes-vous prêt ? (oui/non)')
      .then(() => {
        messageHelper.setCustomNetworkQuestion(testBot, 1)
        return messageHelper.assert('oui', "Redis, c'est un serveur web ? (vrai/faux)")
      })
      .then(() => messageHelper.assert('faux', ['Très bien !', 'Prêt pour la question suivante ? (oui/non)']))
      .then(() => {
        messageHelper.setCustomNetworkQuestion(testBot, 2)
        return messageHelper.assert('oui', 'Combien de couches y-a-t-il dans le modèle OSI ?')
      })
      .then(() => messageHelper.assert('7', ['Très bien !', 'Les questions de réseau sont maintenant terminées.', 'Je vais désormais calculer vos résultats..', undefined]))
      .then(() => expect(messageHelper.getClientChatData(testBot).scoreNetwork).equal(4))
  })
})
