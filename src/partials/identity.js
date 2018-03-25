let { setCurrentState, getCurrentState, setChat } = require('../helper/chatsHandler')

const { state, regex } = require('../helper/variables')

let bot

module.exports.init = (_bot) => {
  bot = _bot
}

module.exports.getName = () => {
  return __filename
}

module.exports.run = function (msg) {
  var id = msg.from.id
  var trigger = true
  let replay = []
  let answer = ''

  switch (true) {
    case regex.identity.test(msg.text) && getCurrentState(id) === state.none:
    case getCurrentState(id) === state.identity.begin:
      bot.stackMessage(id, 'Quel est votre nom ?')
      setCurrentState(id, state.identity.name_asked)
      break
    case getCurrentState(id) === state.identity.name_asked:
      var name = msg.text
      setChat(id, 'name', name)
      bot.stackMessage(id, `Votre nom est '${name}'. Est-ce correct ? (oui/non)`, {
        'reply_markup': {
          'keyboard': [['oui'], ['non']]
        }
      })
      setCurrentState(id, state.identity.name_received)
      break
    case getCurrentState(id) === state.identity.name_received:
      answer = msg.text.toLowerCase()

      if (answer === 'oui') {
        bot.stackMessage(id, 'Très bien, quel est votre prénom ?')
        setCurrentState(id, state.identity.firstname_asked)
      } else {
        // TODO Test this case.
        bot.stackMessage(id, 'Zut ! Recommençons. Donnez-moi votre nom.')
        setCurrentState(id, state.identity.name_asked)
      }
      break
    case getCurrentState(id) === state.identity.firstname_asked:
      var firstname = msg.text
      setChat(id, 'firstname', firstname)
      bot.stackMessage(id, `Votre prénom est '${firstname}'. Est-ce correct ? (oui/non)`, {
        'reply_markup': {
          'keyboard': [['oui'], ['non']]
        }
      })
      setCurrentState(id, state.identity.firstname_received)
      break
    case getCurrentState(id) === state.identity.firstname_received:
      answer = msg.text.toLowerCase()

      if (answer === 'oui') {
        bot.stackMessage(id, 'Très bien, quel est votre email ?')
        setCurrentState(id, state.identity.email_asked)
      } else {
        // TODO Test this case.
        bot.stackMessage(id, 'Zut ! Recommençons. Donnez-moi votre prénom.')
        setCurrentState(id, state.identity.firstname_asked)
      }
      break
    case getCurrentState(id) === state.identity.email_asked:
      var email = msg.text

      if (!regex.email.test(email)) {
        bot.stackMessage(id, 'Votre email est invalide, merci de le saisir à nouveau')
        setCurrentState(id, state.identity.email_asked)
        break
      }

      setChat(id, 'email', email)

      bot.stackMessage(id, `Votre email est '${email}'. Est-ce correct ? (oui/non)`, {
        'reply_markup': {
          'keyboard': [['oui'], ['non']]
        }
      })
      setCurrentState(id, state.identity.email_received)
      break
    case getCurrentState(id) === state.identity.email_received:
      answer = msg.text.toLowerCase()
      if (answer === 'oui') {
        bot.stackMessage(id, 'Parfait !')
        setCurrentState(id, state.end)
        replay.push(require('./common'))
      } else {
        // TODO Test this case.
        bot.stackMessage(id, 'Zut ! Recommençons. Donnez-moi votre email.')
        setCurrentState(id, state.identity.email_asked)
      }
      break
    default:
      trigger = false
      break
  }
  return [trigger, replay]
}
