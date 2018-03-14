let vars = require('./variables')

let client

module.exports.init = (_client) => {
  client = _client
  client.userId = 0
}

module.exports.getClientChatData = (bot) => {
  return bot.chats[`${client.userId}`]
}

const setCurrentQuestion = (bot, idQuestion, variable) => {
  if (JSON.stringify(variable) === JSON.stringify(vars.devQuestions)) {
    bot.chats[`${client.userId}`].currentQuestion = variable[`${idQuestion}`]
    bot.chats[`${client.userId}`].answeredQuestions.push(idQuestion)
  } else {
    bot.chats[`${client.userId}`].currentQuestionNetwork = variable[`${idQuestion}`]
    bot.chats[`${client.userId}`].answeredNetworkQuestions.push(idQuestion)
  }
}

module.exports.setCustomDevQuestion = (bot, idQuestion) => {
  return setCurrentQuestion(bot, idQuestion, vars.devQuestions)
}

module.exports.setCustomNetworkQuestion = (bot, idQuestion) => {
  return setCurrentQuestion(bot, idQuestion, vars.networkQuestions)
}

/**
 * This function fake the creation of a new client to make every tests independant from each others.
*/
module.exports.newClient = () => {
  client.userId += 1
}

module.exports.getStates = () => {
  return vars.state
}

/**
 * @param {string} messageText The message you want to send
 * @param {string|array} expectedMessages
 * The message(s) you expect from the bot.
 * If you expect more than one message, pass an array of messages.
 * If you don't want to check the output, pass an empty string.
 * If you don't care about the content of a message, just put for example :
 * ['message',undefined]  and the function won't check the second message.
 * @param {string} options optional. An array of options
 * Available options :
 * - {string} debug_message:  A debug string to identify the broken part. Can be useful during development.
 * - {boolean} no_check : Tell if we need to check the response of the bot.
 */
module.exports.assert = (messageText, expectedMessages, options = {}) => {
  let debugMessage = options.debug_message || ''
  let noCheck = options.no_check || false
  let message = client.makeMessage(messageText)

  if (!Array.isArray(expectedMessages)) {
    expectedMessages = [expectedMessages]
  }

  return client.sendMessage(message)
    .then(() => {
      return client.getUpdates()
    })
    .then((updates) => {
      if (noCheck === false) {
        if (updates.result.length !== expectedMessages.length) {
          let errorMessage = `${debugMessage}\nUpdates queue should contain ${expectedMessages.length} message(s) but got ${updates.result.length} !` +
            `\nGot ${updates.result.map(x => `\n\t- ${x.message.text}`)} \ninstead of ${expectedMessages.map(x => `\n\t- ${x}`)}`
          throw new Error(errorMessage)
        }

        expectedMessages.forEach((element, index) => {
          if (element === undefined) {
            return
            // We know that we expect a message, but we don't care about the content.
          }

          var message = updates.result[index].message.text

          if (message !== element) {
            throw new Error(`${debugMessage}\nWrong expect message ! Got '${message}' instead of '${element}'`)
          }
        })
      }
    })
}
