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

        this.current_state = this.state.none;

        this.regex = {
            start: /^\/start$/,
            parrot: /^say (.*)$/,
            hello: /^hello$/,
            firstname: /^firstname$/,
        };
        this.setup();
    }

    setup() {
        this.bot.on("message", (msg) => {
            var chatId = msg.from.id;

            switch (true) {
                case this.regex.start.test(msg.text) && this.current_state == this.state.none:
                    this.bot.sendMessage(msg.from.id, "Bonjour !");
                    return;
                case this.regex.parrot.test(msg.text) && this.current_state == this.state.none:
                    var match = this.regex.parrot.exec(msg.text);
                    const text = match[1];
                    this.bot.sendMessage(msg.from.id, text);
                    return;
                case this.regex.hello.test(msg.text) && this.current_state == this.state.none:
                    this.bot.sendMessage(chatId, "Bonjour !");
                    return;
                case this.regex.firstname.test(msg.text) && this.current_state == this.state.none:
                    this.bot.sendMessage(chatId, "Quel est votre nom ?");
                    this.current_state = this.state.identity.name_asked;
                    return;
                case this.current_state == this.state.identity.name_asked:
                    var name = msg.text;
                    this.bot.sendMessage(chatId, `Votre nom est '${name}'. Est-ce correct ? (oui/non)`)
                    this.current_state = this.state.identity.name_received;
                    return;
                case this.current_state == this.state.identity.name_received:
                    var answer = msg.text;

                    if (answer == "oui") {
                        this.bot.sendMessage(chatId, "Très bien, quel est votre prénom ?");
                        this.current_state = this.state.identity.firstname_asked;
                    } else {
                        // TODO Test this case.
                        this.bot.sendMessage(chatId, "Zut ! Recommençons. Donnez-moi votre nom.");
                        this.current_state = this.state.identity.name_asked;
                    }
                    return;
                case this.current_state == this.state.identity.firstname_asked:
                    var firstname = msg.text;
                    this.bot.sendMessage(chatId, `Votre prénom est '${firstname}'. Est-ce correct ? (oui/non)`);
                    this.current_state = this.state.identity.firstname_received;
                    return;
                case this.current_state == this.state.identity.firstname_received:
                    var answer = msg.text;

                    if (answer == "oui") {
                        this.bot.sendMessage(chatId, "Parfait !");
                        this.current_state = this.state.none;
                    } else {
                        // TODO Test this case.
                        this.bot.sendMessage(chatId, "Zut ! Recommençons. Donnez-moi votre prénom.");
                        this.current_state = this.state.identity.firstname_asked;
                    }
                    return;
                default:
                    break;
            }

            // TODO Here we're going to parse text to see what user said.
            this.bot.sendMessage(chatId, "Je n'ai pas compris votre demande.");
        });
    }
}
