const expect = require('chai').expect;
const colors = require("colors");

const TelegramServer = require('telegram-test-api');
const TelegramBot = require('node-telegram-bot-api');
const Bot = require("./bot");

describe("Telegram Tests", () => {

  it('should reply to hello', function () {
    const token = process.env.TOKEN;
    this.slow(1000);
    this.timeout(3000);
    let serverConfig = {
      "port": 9000,
      "host": "localhost",
      "storage": "RAM",
      "storeTimeout": 60
    };
    let server = new TelegramServer(serverConfig);
    let client = server.getClient(token);
    let message = client.makeMessage('hello');
    let telegramBot,
      testBot;
    return server.start()
      .then(() => client.sendMessage(message))
      .then(() => {
        let botOptions = { polling: true, baseApiUrl: server.ApiURL };
        telegramBot = new TelegramBot(token, botOptions);
        testBot = new Bot(telegramBot);
        return client.getUpdates();
      })
      .then((updates) => {
        if (updates.result.length !== 1) {
          throw new Error('updates queue should contain one message!');
        }

        var message = updates.result[0].message.text;

        if (message != "Bonjour à vous !") {
          throw new Error("Wrong expect message ! Got '" + message + "'");
        }

        return true;
      });
  });

});
