'use strict';

var identity_switch = require("./libs/identity");

module.exports = class MyBot {
    constructor(bot) {
        this.bot = bot;

        this.state = {
            none: 0,
            identity: {
                firstname_asked: 1,
                firstname_received: 2,
                name_asked: 4,
                name_received: 5,
            }
        }

        this.chats = {}

        this.regex = {
            start: /^\/start$/,
            parrot: /^say (.*)$/,
            hello: /^hell.?o$/i,
            firstname: /^firstname$/,
        };
        this.setup();
    }

    setup() {
        this.bot.on("message", (msg) => {
            var chatId = msg.from.id;
            var trigger = true;

            if (!(chatId in this.chats)) {
                this.chats[chatId] = {
                    current_state: this.state.none
                }
            }

            switch (true) {
                case this.regex.start.test(msg.text) && this.chats[chatId].current_state == this.state.none:
                    this.bot.sendMessage(msg.from.id, "Bonjour !");
                    return;
                case this.regex.parrot.test(msg.text) && this.chats[chatId].current_state == this.state.none:
                    var match = this.regex.parrot.exec(msg.text);
                    const text = match[1];
                    this.bot.sendMessage(msg.from.id, text);
                    return;
                case this.regex.hello.test(msg.text) && this.chats[chatId].current_state == this.state.none:
                    this.bot.sendMessage(chatId, "Bonjour !");
                    return;
                default:
                    trigger = false;
                    break;
            }

            if (!trigger)
                [this.chats, trigger] = identity_switch(msg, this.bot, this.regex, this.chats, this.state);

            if (!trigger)
                this.bot.sendMessage(chatId, "Je n'ai pas compris votre demande.");
        });
    }
}
