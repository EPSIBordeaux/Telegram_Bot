'use strict';

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
                // IDENTITY 
                case this.regex.firstname.test(msg.text) && this.chats[chatId].current_state == this.state.none:
                    this.bot.sendMessage(chatId, "Quel est votre nom ?");
                    this.chats[chatId].current_state = this.state.identity.name_asked;
                    return;
                case this.chats[chatId].current_state == this.state.identity.name_asked:
                    var name = msg.text;
                    this.bot.sendMessage(chatId, `Votre nom est '${name}'. Est-ce correct ? (oui/non)`)
                    this.chats[chatId].current_state = this.state.identity.name_received;
                    return;
                case this.chats[chatId].current_state == this.state.identity.name_received:
                    var answer = msg.text;

                    if (answer == "oui") {
                        this.bot.sendMessage(chatId, "Très bien, quel est votre prénom ?");
                        this.chats[chatId].current_state = this.state.identity.firstname_asked;
                    } else {
                        // TODO Test this case.
                        this.bot.sendMessage(chatId, "Zut ! Recommençons. Donnez-moi votre nom.");
                        this.chats[chatId].current_state = this.state.identity.name_asked;
                    }
                    return;
                case this.chats[chatId].current_state == this.state.identity.firstname_asked:
                    var firstname = msg.text;
                    this.bot.sendMessage(chatId, `Votre prénom est '${firstname}'. Est-ce correct ? (oui/non)`);
                    this.chats[chatId].current_state = this.state.identity.firstname_received;
                    return;
                case this.chats[chatId].current_state == this.state.identity.firstname_received:
                    var answer = msg.text;

                    if (answer == "oui") {
                        this.bot.sendMessage(chatId, "Parfait !");
                        this.chats[chatId].current_state = this.state.none;
                    } else {
                        // TODO Test this case.
                        this.bot.sendMessage(chatId, "Zut ! Recommençons. Donnez-moi votre prénom.");
                        this.chats[chatId].current_state = this.state.identity.firstname_asked;
                    }
                    return;
                // END IDENTITY
                default:
                    break;
            }

            this.bot.sendMessage(chatId, "Je n'ai pas compris votre demande.");
        });
    }
}
