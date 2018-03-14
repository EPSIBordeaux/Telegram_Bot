let vars = require("./variables");

let client = undefined;

module.exports.init = (_client) => {
  client = _client;
  client.userId = 0;
}

module.exports.getClientChatData = (bot) => {
  return bot.chats[`${client.userId}`];
}

const setCurrentQuestion = (bot, idQuestion, variable) => {
  if (JSON.stringify(variable) === JSON.stringify(vars.devQuestions)) {
    bot.chats[`${client.userId}`].currentQuestion = variable[`${idQuestion}`];
    bot.chats[`${client.userId}`].answeredQuestions.push(idQuestion);
  } else {
    bot.chats[`${client.userId}`].currentQuestionNetwork = variable[`${idQuestion}`];
    bot.chats[`${client.userId}`].answeredNetworkQuestions.push(idQuestion);
  }
}

module.exports.setCustomDevQuestion = (bot, idQuestion) => {
  return setCurrentQuestion(bot, idQuestion, vars.devQuestions);
}

module.exports.setCustomNetworkQuestion = (bot, idQuestion) => {
  return setCurrentQuestion(bot, idQuestion, vars.networkQuestions);
}

/** 
 * This function fake the creation of a new client to make every tests independant from each others.
*/
module.exports.newClient = () => {
  client.userId += 1;
};

module.exports.getStates = () => {
  return vars.state;
}

/**
 * @param {string} message_text The message you want to send
 * @param {string|array} expected_message 
 * The message(s) you expect from the bot. 
 * If you expect more than one message, pass an array of messages.
 * If you don't want to check the output, pass an empty string.
 * @param {string} options optional. An array of options
 * Available options : 
 * - {string} debug_message:  A debug string to identify the broken part. Can be useful during development. 
 * - {boolean} no_check : Tell if we need to check the response of the bot.
 */
module.exports.assert = (message_text, expected_message, options = {}) => {

  let debug_message = options.debug_message || "";
  let no_check = options.no_check || false;
  let message = client.makeMessage(message_text);

  if (!Array.isArray(expected_message)) {
    expected_message = [expected_message];
  }

  return client.sendMessage(message)
    .then(() => {
      return client.getUpdates();
    })
    .then((updates) => {
      if (no_check == false) {
        if (updates.result.length !== expected_message.length) {
          let errorMessage = `${debug_message}\nUpdates queue should contain ${expected_message.length} message(s) but got ${updates.result.length} !`
            + `\nGot ${updates.result.map(x => `\n\t- ${x.message.text}`)} \ninstead of ${expected_message.map(x => `\n\t- ${x}`)}`;
          throw new Error(errorMessage);
        }

        expected_message.forEach((element, index) => {
          var message = updates.result[index].message.text;
          if (message != element) {
            throw new Error(`${debug_message}\nWrong expect message ! Got '${message}' instead of '${element}'`);
          }
        });
      }
    });
}