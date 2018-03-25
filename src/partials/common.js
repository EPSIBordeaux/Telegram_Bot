const state = require('../helper/variables').state
const regex = require('../helper/variables').regex

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
      var answer = msg.text

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
    case regex.parrot.test(msg.text) && chats[`${id}`].current_state === state.none:
      var match = regex.parrot.exec(msg.text)
      const text = match[1]
      bot.stackMessage(id, text)
      break
    case regex.hello.test(msg.text) && chats[`${id}`].current_state === state.none:
      bot.stackMessage(id, 'Bonjour !')
      break
    case chats[`${id}`].current_state === state.end:
      // var user = chats[`${id}`]
      // console.log(user)
      bot.stackMessage(id, "Je vous remercie d'avoir utilisé notre plateforme de recrutement et vous souhaite une agréable journée")
      chats[`${id}`].current_state = state.none
      break
    default:
      trigger = false
      break
  }
  return [trigger, replay, chats]
}
