const expect = require('chai').expect;

const TelegramServer = require('telegram-test-api');
const TeleBot = require('telebot');
const Bot = require("./bot");

const serverConfig = {
  "port": 9000,
  "host": "localhost",
  "storage": "RAM",
  "storeTimeout": 60
};

it('should greet Masha and Sasha', function testFull() {
  const token = process.env.TOKEN;
  this.slow(400);
  this.timeout(5000000);
  let serverConfig = { port: 9000 };
  let server = new TelegramServer(serverConfig);
  let client = server.getClient(token);
  let message = client.makeMessage('/start');
  let telegramBot,
    testBot;
  return server.start()
    .then(() => client.sendMessage(message))
    .then(() => {
      let botOptions = { token: token, polling: true, baseApiUrl: server.ApiURL };
      telegramBot = new TeleBot(botOptions);
      testBot = new Bot(telegramBot);
      return client.getUpdates();
    })
    .then((updates) => {
      console.log(colors.blue(`Client received messages: ${JSON.stringify(updates.result)}`));
      if (updates.result.length !== 1) {
        throw new Error('updates queue should contain one message!');
      }
      let keyboard = JSON.parse(updates.result[0].message.reply_markup).keyboard;
      message = client.makeMessage(keyboard[0][0].text);
      client.sendMessage(message);
      return client.getUpdates();
    })
    .then((updates) => {
      console.log(colors.blue(`Client received messages: ${JSON.stringify(updates.result)}`));
      if (updates.result.length !== 1) {
        throw new Error('updates queue should contain one message!');
      }
      if (updates.result[0].message.text !== 'Hello, Masha!') {
        throw new Error('Wrong greeting message!');
      }
      return true;
    })
});