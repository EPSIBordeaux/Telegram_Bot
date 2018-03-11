let client = undefined;

module.exports.init = (_client) => {
  client = _client;
  client.userId = 0;
}

/** 
 * This function fake the creation of a new client to make every tests independant from each others.
*/
module.exports.newClient = () => {
  client.userId += 1;
};

/**
 * @param {string} message_text The message you want to send
 * @param {string|array} expected_message 
 *  The message(s) you expect from the bot. If you expect more than one message, pass an array of messages.
 * @param {string} debug_message optional. A debug string to identify the broken part. Can be useful during development. 
 */
module.exports.assert = (message_text, expected_message, debug_message = "") => {
  let message = client.makeMessage(message_text);

  if (!Array.isArray(expected_message)) {
    expected_message = [expected_message];
  }

  return client.sendMessage(message)
    .then(() => {
      return client.getUpdates();
    })
    .then((updates) => {
      if (updates.result.length !== expected_message.length) {
        throw new Error(`updates queue should contain ${expected_message.length} message(s) !`);
      }

      expected_message.forEach((element, index) => {
        var message = updates.result[index].message.text;
        if (message != element) {
          throw new Error(`${debug_message}\nWrong expect message ! Got '${message}' instead of '${element}'`);
        }
      });
    });
}