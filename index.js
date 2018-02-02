require("dotenv").config();

const TelegramBot = require('node-telegram-bot-api');
const request = require("request");
const Bot = require("./bot");
const token = process.env.TOKEN;
const options = {
    polling: true
};

if (process.env.HEROKU_APP_NAME != undefined) {
    var http = require("http");
    setInterval(function () {
        http.get(`http://${process.env.HEROKU_APP_NAME}.herokuapp.com`);
    }, 300000); // every 5 minutes (300000)
}

var telebot = new TelegramBot(token, options);

var bot = new Bot(telebot);