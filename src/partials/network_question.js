let { handleQuestions } = require('../helper/questionsHandler')

const regex = require('../helper/variables').regex

let bot

module.exports.init = (_bot) => {
  bot = _bot
}

module.exports.getName = () => {
  return __filename
}

module.exports.run = function (msg, chats) {
  return handleQuestions(false, 'networkQuestionCount', 'currentQuestionNetwork', 'scoreNetwork', 'answeredNetworkQuestions', regex.network_question, bot, msg, chats)
}
