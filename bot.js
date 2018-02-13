'use strict';

module.exports = class MyBot {
    constructor(bot) {
        this.bot = bot;

        this.state = {
            none: 0,
            identity: {
                firstname_asked: 1,
                firstname_received: 2,
                firstname_confirmed: 3,
                name_asked: 4,
                name_received: 5,
                name_confirmed: 6
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
                    this.bot.sendMessage(chatId, `Votre nom est '${name}'. Est-ce correct ? (oui/non)'`)
                    this.current_state = this.state.identity.name_received;
                    return;
                default:
                    break;
            }

            // TODO Here we're going to parse text to see what user said.
            this.bot.sendMessage(chatId, "Je n'ai pas compris votre demande.");
        });

    }
}
