const state = require('../helper/variables').state
const regex = require('../helper/variables').regex
const nodemailer = require('nodemailer')
const configuration = require('../helper/variables').config

let bot

module.exports.init = (_bot) => {
  bot = _bot
}

module.exports.getName = () => {
  return __filename
}

module.exports.run = function (msg, chats) {
  var id = msg.from.id
  var trigger = true
  let replay = []

  switch (true) {
    case regex.reset.test(msg.text):
      bot.stackMessage(id, "Recommençons ! Tapez 'start' pour commencer")
      bot.flush(id)
      bot.reset(id)
      chats = bot.chats
      break
    case regex.start.test(msg.text) && chats[`${id}`].current_state === state.none:
      bot.stackMessage(id, 'Bonjour !\nJe me présente, je suis un petit bot de recrutement.\nSi vous le souhaitez, je vais vous poser quelques questions afin de voir quel poste pourrait vous convenir. Êtes-vous prêt ?', {
        'reply_markup': {
          'keyboard': [['oui'], ['non']]
        }
      })
      chats[`${id}`].current_state = state.onBoarding.asked
      break
    case chats[`${id}`].current_state === state.onBoarding.asked:
      var answer = msg.text.toLowerCase()

      let response = ''
      let options = {}
      if (answer === 'oui') {
        response = 'Parfait, commençons !'
        chats[`${id}`].current_state = state.devQuestions.begin
        replay.push(require('./dev_question'))
      } else {
        response = "Très bien, dites moi 'oui' quand vous serez prêt !"
        options = {
          'reply_markup': {
            'keyboard': [['oui'], ['non']]
          }
        }
      }

      bot.stackMessage(id, response, options)

      break
    case regex.parrot.test(msg.text) && chats[`${id}`].current_state === state.none && process.env.NODE_ENV === 'test':
      var match = regex.parrot.exec(msg.text)
      const text = match[1]
      bot.stackMessage(id, text)
      break
    case regex.hello.test(msg.text) && chats[`${id}`].current_state === state.none && process.env.NODE_ENV === 'test':
      bot.stackMessage(id, 'Bonjour !')
      break
    case chats[`${id}`].current_state === state.end:
      bot.stackMessage(id, "Je vous remercie d'avoir utilisé notre plateforme de recrutement et vous souhaite une agréable journée")
      chats[`${id}`].current_state = state.none

      if (process.env.NODE_ENV !== 'test' && process.env.SMTP_USER !== undefined && process.env.SMTP_PASSWORD !== undefined) {
        let transporter
        var { name, firstname, email, jobSelected, jobs } = chats[`${id}`]

        let userScoreDev = chats[`${id}`].scoreDev
        let userScoreNetwork = chats[`${id}`].scoreNetwork

        let maxScoreDev = 0
        if (chats[`${id}`].answeredQuestions.length > 0) {
          maxScoreDev = chats[`${id}`].answeredQuestions.reduce((total, element) => { total += element; return total })
        }

        let maxScoreNetwork = 0
        if (chats[`${id}`].answeredNetworkQuestions.length > 0) {
          maxScoreNetwork = chats[`${id}`].answeredNetworkQuestions.reduce((total, element) => { total += element; return total })
        }

        let userDevPercentage = (userScoreDev / maxScoreDev * 100).toFixed(0)
        let userNetworkPercentage = (userScoreNetwork / maxScoreNetwork * 100).toFixed(0)

        let body = `Bonjour,
  Nouveau résultat en provenance du bot de recrutement.
  Nom : ${name} 
  Prénom : ${firstname} 
  Email : ${email}
  Score sur les questions de développement : ${userDevPercentage}%
  Score sur les questions de réseau : ${userNetworkPercentage}%
    
  Jobs proposés : ${jobs.map((element) => `\n\t- ${element.id} - ${element.name} - ${element.url}`)}
    
  Job selectionné : ${jobSelected.map((element) => `\n\t- ${element.id} - ${element.name} - ${element.url}`)}`

        // In real life, we should be sending the email to configuration.mailTo
        // But as a demonstration, we will send it to the user to prove it work :)
        let mailOptions = {
          from: configuration.sender,
          replyTo: email,
          to: email,
          subject: 'Recrutement - Résultat',
          text: body
        }

        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: Boolean(process.env.SMTP_TLS),
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
          }
        })

        // send mail with defined transport object
        transporter.sendMail(mailOptions).then((info) => {
          console.log('Message sent: %s', info.messageId)
        }).catch((err) => {
          console.log(err)
          throw err
        })
      }
      break
    default:
      trigger = false
      break
  }
  return [trigger, replay, chats]
}
