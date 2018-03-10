let client = undefined;

module.exports.init = (_client) => {
    client = _client;
}

module.exports.assert = (message_text, expected_message) => {
    let message = client.makeMessage(message_text);
    return client.sendMessage(message)
      .then(() => {
        return client.getUpdates();
      })
      .then((updates) => {
        if (updates.result.length !== 1) {
          throw new Error('updates queue should contain one message!');
        }

        var message = updates.result[0].message.text;

        if (message != expected_message) {
          throw new Error("Wrong expect message ! Got '" + message + "'");
        }
      });
}