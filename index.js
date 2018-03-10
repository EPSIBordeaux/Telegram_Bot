require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const Bot = require('./bot');

const token = process.env.TOKEN;
const options = {
  polling: true,
};

const telebot = new TelegramBot(token, options);

const bot = new Bot(telebot);

