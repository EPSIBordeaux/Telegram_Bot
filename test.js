require("dotenv").config();
const expect = require('chai').expect;

const TelegramServer = require('telegram-test-api');
const TelegramBot = require('node-telegram-bot-api');
const Bot = require("./bot");
const messageHelper = require("./helper/message_helper");

describe("Simple test", function () {

  let client, server, token, telegramBot, testBot;

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

    client = server.getClient(token);
    let botOptions = { polling: true, baseApiUrl: server.ApiURL };
    telegramBot = new TelegramBot(token, botOptions);
    testBot = new Bot(telegramBot);

    messageHelper.init(client);

    done();
  });

  after(function (done) {
    // Because server.close() doesn't work and freeze CI
    if (process.env.CIRCLECI != undefined) {
      process.exit();
    }
    server.close();
    done();
  })

  it('should welcome the user', function () {
    this.slow(1000);
    this.timeout(3000);

    return messageHelper.assert("/start", "Bonjour !", true);
    throw new Error("Server couldn't start");
  });

  it('should do the parrot', function () {
    this.slow(1000);
    this.timeout(3000);

    return messageHelper.assert("say hello", "hello");
    throw new Error("Server couldn't start");
  });

  it('should ask firstname and name', function () {
    this.slow(2000);
    this.timeout(3000);

    return messageHelper.assert("firstname", "Quel est votre nom ?")
      .then(() => messageHelper.assert("Dupont", "Votre nom est 'Dupont'. Est-ce correct ? (oui/non)"))
      .then(() => messageHelper.assert("oui", "Très bien, quel est votre prénom ?"))
      .then(() => messageHelper.assert("Jean", "Votre prénom est 'Jean'. Est-ce correct ? (oui/non)"))
      .then(() => messageHelper.assert("oui", "Parfait !"));

    throw new Error("Server couldn't start");
  });

});