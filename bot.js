'use strict';

const state = require("./helper/variables").state;
const regex = require('./helper/variables').regex;

let identity_switch = require("./partials/identity");
let dev_question = require("./partials/dev_question");
let common = require("./partials/common");

const partials = [common, identity_switch, dev_question];

module.exports = class MyBot {
    constructor(bot) {
        this.bot = bot;
        this.chats = {}

        partials.forEach((partial) => {
            partial.init(this.bot);
        });

        this.setup();
    }

    setup() {
        this.bot.on("message", (msg) => {
            let chatId = msg.from.id;
            let trigger = false;

            if (!(chatId in this.chats)) {
                this.chats[chatId] = {
                    current_state: state.none
                }
            }

            partials.forEach((partial) => {
                if (!trigger)
                    [this.chats, trigger] = partial.run(msg, this.chats);
            });

            if (!trigger)
                this.bot.sendMessage(chatId, "Je n'ai pas compris votre demande.");
        });

        this.bot.on('polling_error', (error) => {
            console.log(error.code);  // => 'EFATAL'
        });
    }
}
