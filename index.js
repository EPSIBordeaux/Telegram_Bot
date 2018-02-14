require("dotenv").config();

const TelegramBot = require('node-telegram-bot-api');
const request = require("request");
const Bot = require("./bot");
const token = process.env.TOKEN;
const options = {
    polling: true
};

var telebot = new TelegramBot(token, options);

var bot = new Bot(telebot);