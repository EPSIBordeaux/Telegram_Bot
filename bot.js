'use strict';

module.exports = class MyBot {
    constructor(bot) {
        this.bot = bot;
        this.setup();
    }

    setup() {
        this.bot.on("message", (msg) => {
            var chatId = msg.from.id;

            if (msg.text == "/start") {
                return;
            }

            if (msg.text == "hello") {
                this.bot.sendMessage(chatId, "Bonjour !");
                return;
            }

            // TODO Here we're going to parse text to see what user said.
            this.bot.sendMessage(chatId, msg.text);
        });

        this.bot.onText(/\/start/, (msg) => {
            this.bot.sendMessage(msg.from.id, "Bonjour !");
        });

        this.bot.on("newChatMembers", (msg) => {
            var participant = msg.new_chat_participant;
            this.bot.sendMessage(msg.from.id, "Bienvenue " + participant.first_name + " (" + participant.username + ")");
        });

        this.bot.on("leftChatMember", (msg) => {
            var left = msg.left_chat_member;
            var identity = left.first_name + " " + left.last_name;
            this.bot.sendMessage(msg.from.id, identity + " left ! ");
        });
    }
}
