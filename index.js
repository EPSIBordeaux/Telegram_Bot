require("dotenv").config();

const TeleBot = require('telebot');
const request = require("request");
const Bot = require("./bot");

var telebot = new TeleBot({ token: process.env.TOKEN });

var bot = new Bot(telebot);
bot.start();