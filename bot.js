'use strict';

module.exports = class MyBot {
    constructor(bot) {
        this.bot = bot;
        this.setup();
    }

    setup() {
        this.bot.on("text", (msg) => {

            if (msg.text == "hello") {
                msg.reply.text("Bonjour à vous !");
                return;
            }

            // TODO Here we're going to parse text to see what user said.
            msg.reply.text(msg.text);
        });

        this.bot.on("newChatMembers", (msg) => {
            var participant = msg.new_chat_participant;
            msg.reply.text("Bienvenue " + participant.first_name + " (" + participant.username + ")");
        });

        this.bot.on("leftChatMember", (msg) => {
            var left = msg.left_chat_member;
            var identity = left.first_name + " " + left.last_name;
            msg.reply.text(identity + " left ! ");
        });
    }

    start() {
        this.bot.start();
    }
}
