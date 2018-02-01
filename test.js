require("dotenv").config();
const expect = require('chai').expect;

const TelegramServer = require('telegram-test-api');
const TelegramBot = require('node-telegram-bot-api');
const Bot = require("./bot");

describe("Simple test", function () {

  var client, server, token;

  beforeEach(function (done) {
    token = process.env.TOKEN;
    let serverConfig = {
      "port": 9000,
      "host": "localhost",
      "storage": "RAM",
      "storeTimeout": 60
    };
    server = new TelegramServer(serverConfig);

    // Ugly hack to remove middleware that log every request. 
    // MUST be called before server is started
    server.webServer._router.stack.pop();

    client = server.getClient(token);
    done();
  });

  after(function (done) {
    // Because server.close() doesn't work
    process.exit();
  })

  it('should reply to hello', function () {

    this.slow(1000);
    this.timeout(3000);

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
      }).then(() => server.close());

    throw new Error("Server couldn't start");
  });

  // FIXME Stop this test !
});