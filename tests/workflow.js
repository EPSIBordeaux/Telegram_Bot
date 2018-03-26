require('dotenv').config()
const expect = require('chai').expect

const { before, beforeEach, after, it, describe } = require('mocha')

const TelegramServer = require('telegram-test-api')
const Bot = require('../src/bot')
const messageHelper = require('../src/helper/test_message_helper')
const { jobs } = require('../src/helper/variables')
const airbrake = require('../src/helper/airbrake')

airbrake.run()

let client, server, token, testBot

describe('Workflow tests', function () {
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

  it('Should be a conversation workflow', function () {
    this.slow(3000)
    this.timeout(6000)

    return messageHelper.assert('/start', 'Bonjour !\nJe me présente, je suis un petit bot de recrutement.\nSi vous le souhaitez, je vais vous poser quelques questions afin de voir quel poste pourrait vous convenir. Êtes-vous prêt ?')
      .then(() => messageHelper.assert('oui', ['Parfait, commençons !', 'Voici une question de développement, êtes-vous prêt ? (oui/non)']))
      .then(() => messageHelper.assert('oui', '', { no_check: true }))
      .then(() => messageHelper.assert('Je ne répondrais pas !', ['Vous avez mal répondu.', 'Prêt pour la question suivante ? (oui/non)'], { debug_message: 'AZE' }))
      .then(() => messageHelper.assert('oui', '', { no_check: true }))
      .then(() => messageHelper.assert('Je ne répondrais pas !', ['Vous avez mal répondu.', 'Prêt pour la question suivante ? (oui/non)'], { debug_message: 'POI' }))
      .then(() => messageHelper.assert('oui', '', { no_check: true }))
      .then(() => messageHelper.assert('Je ne répondrais pas !', ['Vous avez mal répondu.', 'Les questions de développement sont maintenant terminées.', 'Voici une question de réseau, êtes-vous prêt ? (oui/non)']))
  })

  it("Should answer right to all questions but don't want a job", function () {
    this.slow(5000)
    this.timeout(7000)

    return messageHelper.assert('/start', 'Bonjour !\nJe me présente, je suis un petit bot de recrutement.\nSi vous le souhaitez, je vais vous poser quelques questions afin de voir quel poste pourrait vous convenir. Êtes-vous prêt ?')
      .then(() => messageHelper.assert('oui', ['Parfait, commençons !', 'Voici une question de développement, êtes-vous prêt ? (oui/non)']))
      .then(() => {
        messageHelper.setCustomDevQuestion(testBot, 1)
        return messageHelper.assert('oui', 'Le C est un language compilé. (vrai/faux)')
      })
      .then(() => messageHelper.assert('vrai', ['Très bien !', 'Prêt pour la question suivante ? (oui/non)']))
      .then(() => {
        messageHelper.setCustomDevQuestion(testBot, 2)
        return messageHelper.assert('oui', 'Ecrivez une fonction qui inverse une chaine de charactère.\nLa valeur sera retournée à la fin de la fonction')
      })
      .then(() => messageHelper.assert("function a(my_string) {return my_string.split('').reverse().join('');}", ['Très bien !', 'Prêt pour la question suivante ? (oui/non)']))
      .then(() => {
        messageHelper.setCustomDevQuestion(testBot, 3)
        return messageHelper.assert('oui', "Lequel de ces framework n'est pas un framework PHP ?")
      })
      .then(() => messageHelper.assert('Meteor', ['Très bien !', 'Les questions de développement sont maintenant terminées.', 'Voici une question de réseau, êtes-vous prêt ? (oui/non)']))
      .then(() => {
        messageHelper.setCustomNetworkQuestion(testBot, 1)
        return messageHelper.assert('oui', 'Redis, c\'est un serveur web ? (vrai/faux)')
      })
      .then(() => messageHelper.assert('faux', ['Très bien !', 'Prêt pour la question suivante ? (oui/non)']))
      .then(() => {
        messageHelper.setCustomNetworkQuestion(testBot, 2)
        return messageHelper.assert('oui', 'Combien de couches y-a-t-il dans le modèle OSI ?')
      })
      .then(() => {
        let expect = 'Suite à vos tests, voici les offres que nous pouvons vous proposer.\n1 - Développeur Web Junior - https://goo.gl/Y77Yrp :\n\t- Specialité : Développement\n\t- Description : Une super offre! \n\t- Type de contrat : CDI\n2 - Admin Système Junior - https://goo.gl/wYAeZm :\n\t- Specialité : Réseau\n\t- Description : Une super offre! \n\t- Type de contrat : CDI\n3 - Admin Système Junior - https://goo.gl/Y77Yrp :\n\t- Specialité : Réseau\n\t- Description : Une super offre !\n\t- Type de contrat : CDI\n4 - Développeur Web - https://goo.gl/wYAeZm :\n\t- Specialité : Développement\n\t- Description : Une super offre de stage! \n\t- Type de contrat : stage\nVeuillez choisir le poste qui vous intéresse en cliquant sur sa référence, ou sur aucun si aucun poste ne vous intéresse.'
        return messageHelper.assert('7', ['Très bien !', 'Les questions de réseau sont maintenant terminées.', 'Je vais désormais calculer vos résultats..', expect])
      })
      .then(() => messageHelper.assert('Aucun', "Nous sommes désolé de ne pas avoir d'offres qui vous conviennent.\nVoulez-vous nous laisser vos coordonnées afin que nous puissions vous recontacter lorsque nous aurons de nouvelles offres ?"))
      .then(() => messageHelper.assert('non', ["Je ne peux rien faire sans votre accord. Je suis donc dans l'obligation de mettre fin à cette conversation.", "Je vous remercie d'avoir utilisé notre plateforme de recrutement et vous souhaite une agréable journée"]))
  })

  it('Should have an object ready to be emailed', function () {
    this.slow(5000)
    this.timeout(7000)

    return messageHelper.assert('/start', 'Bonjour !\nJe me présente, je suis un petit bot de recrutement.\nSi vous le souhaitez, je vais vous poser quelques questions afin de voir quel poste pourrait vous convenir. Êtes-vous prêt ?')
      .then(() => messageHelper.assert('oui', ['Parfait, commençons !', 'Voici une question de développement, êtes-vous prêt ? (oui/non)']))
      .then(() => {
        messageHelper.setCustomDevQuestion(testBot, 1)
        return messageHelper.assert('oui', 'Le C est un language compilé. (vrai/faux)')
      })
      .then(() => messageHelper.assert('vrai', ['Très bien !', 'Prêt pour la question suivante ? (oui/non)']))
      .then(() => {
        messageHelper.setCustomDevQuestion(testBot, 2)
        return messageHelper.assert('oui', 'Ecrivez une fonction qui inverse une chaine de charactère.\nLa valeur sera retournée à la fin de la fonction')
      })
      .then(() => messageHelper.assert("function a(my_string) {return my_string.split('').reverse().join('');}", ['Très bien !', 'Prêt pour la question suivante ? (oui/non)']))
      .then(() => {
        messageHelper.setCustomDevQuestion(testBot, 3)
        return messageHelper.assert('oui', "Lequel de ces framework n'est pas un framework PHP ?")
      })
      .then(() => messageHelper.assert('Meteor', ['Très bien !', 'Les questions de développement sont maintenant terminées.', 'Voici une question de réseau, êtes-vous prêt ? (oui/non)']))
      .then(() => {
        messageHelper.setCustomNetworkQuestion(testBot, 1)
        return messageHelper.assert('oui', 'Redis, c\'est un serveur web ? (vrai/faux)')
      })
      .then(() => messageHelper.assert('faux', ['Très bien !', 'Prêt pour la question suivante ? (oui/non)']))
      .then(() => {
        messageHelper.setCustomNetworkQuestion(testBot, 2)
        return messageHelper.assert('oui', 'Combien de couches y-a-t-il dans le modèle OSI ?')
      })
      .then(() => {
        let expect = 'Suite à vos tests, voici les offres que nous pouvons vous proposer.\n1 - Développeur Web Junior - https://goo.gl/Y77Yrp :\n\t- Specialité : Développement\n\t- Description : Une super offre! \n\t- Type de contrat : CDI\n2 - Admin Système Junior - https://goo.gl/wYAeZm :\n\t- Specialité : Réseau\n\t- Description : Une super offre! \n\t- Type de contrat : CDI\n3 - Admin Système Junior - https://goo.gl/Y77Yrp :\n\t- Specialité : Réseau\n\t- Description : Une super offre !\n\t- Type de contrat : CDI\n4 - Développeur Web - https://goo.gl/wYAeZm :\n\t- Specialité : Développement\n\t- Description : Une super offre de stage! \n\t- Type de contrat : stage\nVeuillez choisir le poste qui vous intéresse en cliquant sur sa référence, ou sur aucun si aucun poste ne vous intéresse.'
        return messageHelper.assert('7', ['Très bien !', 'Les questions de réseau sont maintenant terminées.', 'Je vais désormais calculer vos résultats..', expect])
      })
      .then(() => messageHelper.assert('Aucun', "Nous sommes désolé de ne pas avoir d'offres qui vous conviennent.\nVoulez-vous nous laisser vos coordonnées afin que nous puissions vous recontacter lorsque nous aurons de nouvelles offres ?"))
      .then(() => messageHelper.assert('non', ["Je ne peux rien faire sans votre accord. Je suis donc dans l'obligation de mettre fin à cette conversation.", "Je vous remercie d'avoir utilisé notre plateforme de recrutement et vous souhaite une agréable journée"]))
      .then(() => {
        let user = messageHelper.getClientChatData(testBot)
        var identity = user.identity
        var userJobs = user.jobs
        var jobSelected = user.jobSelected
        expect(jobs).deep.equal(userJobs)
        expect(identity).equal(undefined)
        expect(jobSelected).equal(undefined)
      })
  })
})
