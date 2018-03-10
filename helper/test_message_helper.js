let client = undefined;

module.exports.init = (_client) => {
  client = _client;
}

/**
 * 
 * @param {string} message_text 
 * @param {string|array} expected_message 
 * @param {int} nb_messages_expected 
 * @param {string} debug_message 
 */
module.exports.assert = (message_text, expected_message, nb_messages_expected = 1, debug_message = "") => {
  let message = client.makeMessage(message_text);
  return client.sendMessage(message)
    .then(() => {
      return client.getUpdates();
    })
    .then((updates) => {
      if (updates.result.length !== nb_messages_expected) {
        console.log(updates.result);
        throw new Error(`updates queue should contain ${nb_messages_expected} message(s) !`);
      }

      expected_message = nb_messages_expected == 1 ? [expected_message] : expected_message;
      expected_message.forEach((element, index) => {
        var message = updates.result[index].message.text;
        if (message != element) {
          throw new Error(`${debug_message}Wrong expect message ! Got '${message}'`);
        }
      });
    });
}