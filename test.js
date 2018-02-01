var
  TelegramTester = require('telegram-test'),
  TelegramBot      = require('telebot'),
  Bot = require("./bot");
  telegramBot = new TelegramBot({ token: process.env.TOKEN });

var expect = require('chai').expect;

describe('Telegram Test', ()=> {
  const myBot = new Bot(telegramBot);
  myBot.start();
  let testChat = 1;
  it('should be able to reply to hello', () => {
    const telegramTest = new TelegramTester(telegramBot);
    console.log(telegramTest);
    return telegramTest.sendUpdate(testChat, 'hello')
      .then((data)=> {
        if (data.text === 'Bonjour à vous !') {
          return true;
        }
        throw new Error(`Wrong answer for hello! (was  ${data.text})`);
      });
  });
});