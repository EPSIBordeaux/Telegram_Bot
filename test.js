require("dotenv").config();
const expect = require('chai').expect;

const TelegramServer = require('telegram-test-api');
const TelegramBot = require('node-telegram-bot-api');
const Bot = require("./bot");

describe("Simple test", function () {

  var client, server, token;

  before(function (done) {
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

    server.start();
    done();
  });

  after(function (done) {
    // Because server.close() doesn't work
    //process.exit();
    server.close();
    done();
  })

  it('should welcome the user', function () {
    client = server.getClient(token);
    this.slow(1000);
    this.timeout(3000);

    let message = client.makeMessage('/start');
    let telegramBot,
      testBot;
    return client.sendMessage(message)
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

        if (message != "Bonjour !") {
          throw new Error("Wrong expect message ! Got '" + message + "'");
        }

        return true;
      });

    throw new Error("Server couldn't start");
  });


  it('should do the parrot', function () {
    client = server.getClient(token);
    this.slow(1000);
    this.timeout(3000);

    let message = client.makeMessage('say hello');
    let telegramBot,
      testBot;
    return client.sendMessage(message)
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

        if (message != "hello") {
          throw new Error("Wrong expect message ! Got '" + message + "'");
        }

        return true;
      });

    throw new Error("Server couldn't start");
  });

  it("Should ask firstname and name", () => {
    client = server.getClient(token);
    this.slow(1000);
    this.timeout(3000);

    let message = client.makeMessage('firstname');
    let telegramBot,
      testBot;
    return client.sendMessage(message)
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

        if (message != "Quel est votre nom ?") {
          throw new Error("Ask name - Wrong expect message ! Got '" + message + "'");
        }

        client.sendMessage(client.makeMessage("Dupond"));
        return client.getUpdates();
      }).then((updates) => {
        if (updates.result.length !== 1) {
          throw new Error('updates queue should contain one message!');
        }

        var message = updates.result[0].message.text;
        
        if (message != "Votre nom est 'Dupond'. Est-ce correct ? (oui/non)") {
          throw new Error("Confirm name - Wrong expect message ! Got '" + message + "'");
        }

        return client.sendMessage(client.makeMessage("oui"));
      }).then((updates) => {
        if (updates.result.length !== 1) {
          throw new Error('updates queue should contain one message!');
        }

        var message = updates.result[0].message.text;

        if (message != "Très bien, quel est votre prénom ?") {
          throw new Error("Ask firstname - Wrong expect message ! Got '" + message + "'");
        }

        client.sendMessage(client.makeMessage("Jean"));
        return client.getUpdates();
      }).then((updates) => {
        if (updates.result.length !== 1) {
          throw new Error('updates queue should contain one message!');
        }

        var message = updates.result[0].message.text;

        if (message != "Votre prénom est 'Jean'. Est-ce correct ? (oui/non)") {
          throw new Error("Confirm firstname - Wrong expect message ! Got '" + message + "'");
        }

        client.sendMessage(client.makeMessage("oui"));
        return client.getUpdates();
      }).then((updates) => {
        if (updates.result.length !== 1) {
          throw new Error('updates queue should contain one message!');
        }

        var message = updates.result[0].message.text;

        if (message != "Parfait !") {
          throw new Error("End of talk - Wrong expect message ! Got '" + message + "'");
        }

        return true;
      });

    throw new Error("Server couldn't start");
  });

});