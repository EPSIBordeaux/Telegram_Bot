var
  TelegramTester = require('telegram-test'),
  TelegramBot = require('telebot'),
  telegramBot = new TelegramBot({ token: process.env.TOKEN });

var expect = require('chai').expect;

describe('Telegram Test', () => {
  const myBot = new TelegramBot(telegramBot);
  let testChat = 1;
  it('should be able to talk with sample bot', () => {
    const telegramTest = new TelegramBot(telegramBot);
    return telegramTest.sendUpdate(testChat, '/ping')
      .then((data) => {
        if (data.text === 'pong') {
          return telegramTest.sendUpdate(testChat, '/start');
        }
        throw new Error(`Wrong answer for ping! (was  ${data.text})`);
      })
      .then(data => telegramTest.sendUpdate(testChat, data.keyboard[0][0].text))
      .then((data) => {
        if (data.text === 'Hello, Masha!') {
          return true;
        }
        throw new Error('Wrong greeting!');
      });
  });
});