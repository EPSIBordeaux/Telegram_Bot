const { state, regex } = require('../helper/variables')

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
  let answer = ''

  switch (true) {
    case regex.identity.test(msg.text) && chats[`${id}`].current_state === state.none && process.env.NODE_ENV === 'test':
    case chats[`${id}`].current_state === state.identity.begin:
      bot.stackMessage(id, 'Quel est votre nom ?')
      chats[`${id}`].current_state = state.identity.name_asked
      break
    case chats[`${id}`].current_state === state.identity.name_asked:
      var name = msg.text
      chats[`${id}`]['name'] = name
      bot.stackMessage(id, `Votre nom est '${name}'. Est-ce correct ? (oui/non)`, {
        'reply_markup': {
          'keyboard': [['oui'], ['non']]
        }
      })
      chats[`${id}`].current_state = state.identity.name_received
      break
    case chats[`${id}`].current_state === state.identity.name_received:
      answer = msg.text.toLowerCase()

      if (answer === 'oui') {
        bot.stackMessage(id, 'Très bien, quel est votre prénom ?')
        chats[`${id}`].current_state = state.identity.firstname_asked
      } else {
        bot.stackMessage(id, 'Zut ! Recommençons. Donnez-moi votre nom.')
        chats[`${id}`].current_state = state.identity.name_asked
      }
      break
    case chats[`${id}`].current_state === state.identity.firstname_asked:
      var firstname = msg.text
      chats[`${id}`]['firstname'] = firstname
      bot.stackMessage(id, `Votre prénom est '${firstname}'. Est-ce correct ? (oui/non)`, {
        'reply_markup': {
          'keyboard': [['oui'], ['non']]
        }
      })
      chats[`${id}`].current_state = state.identity.firstname_received
      break
    case chats[`${id}`].current_state === state.identity.firstname_received:
      answer = msg.text.toLowerCase()

      if (answer === 'oui') {
        bot.stackMessage(id, 'Très bien, quel est votre email ?')
        chats[`${id}`].current_state = state.identity.email_asked
      } else {
        bot.stackMessage(id, 'Zut ! Recommençons. Donnez-moi votre prénom.')
        chats[`${id}`].current_state = state.identity.firstname_asked
      }
      break
    case chats[`${id}`].current_state === state.identity.email_asked:
      var email = msg.text

      if (!regex.email.test(email)) {
        bot.stackMessage(id, 'Votre email est invalide, merci de le saisir à nouveau')
        chats[`${id}`].current_state = state.identity.email_asked
        break
      }

      chats[`${id}`]['email'] = email

      bot.stackMessage(id, `Votre email est '${email}'. Est-ce correct ? (oui/non)`, {
        'reply_markup': {
          'keyboard': [['oui'], ['non']]
        }
      })
      chats[`${id}`].current_state = state.identity.email_received
      break
    case chats[`${id}`].current_state === state.identity.email_received:
      answer = msg.text.toLowerCase()
      if (answer === 'oui') {
        bot.stackMessage(id, 'Parfait !')
        chats[`${id}`].current_state = state.end
        replay.push(require('./common'))
      } else {
        bot.stackMessage(id, 'Zut ! Recommençons. Donnez-moi votre email.')
        chats[`${id}`].current_state = state.identity.email_asked
      }
      break
    default:
      trigger = false
      break
  }
  return [trigger, replay, chats]
}
