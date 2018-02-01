require("dotenv").config();

const TeleBot = require('telebot');
const request = require("request");

var bot = new TeleBot({ token: process.env.TOKEN });

bot.on("text", (msg) => {

    if (msg.text == "hello") {
        msg.reply.text("Bonjour à vous !");
        return;
    }

    // TODO Here we're going to parse text to see what user said.
    msg.reply.text(msg.text);    
});

bot.on("newChatMembers", (msg) => {
    var participant = msg.new_chat_participant;
    msg.reply.text("Bienvenue " + participant.first_name + " (" + participant.username + ")");
});

bot.on("leftChatMember", (msg) => {
    var left = msg.left_chat_member;
    var identity = left.first_name + " " + left.last_name;
    msg.reply.text(identity + " left ! ");
});

bot.start();