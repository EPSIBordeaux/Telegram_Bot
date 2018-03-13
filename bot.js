'use strict';

const TelegramBot = require('node-telegram-bot-api');
const chatHandler = require('./helper/chatsHandler');

const state = require("./helper/variables").state;
const regex = require('./helper/variables').regex;

let identity_switch = require("./partials/identity");
let dev_questions = require("./partials/dev_question");
let common = require("./partials/common");
let network_questions = require("./partials/network_question");

const partials = [common, identity_switch, dev_questions, network_questions];

class MyChatBot extends TelegramBot {

    constructor(token, options) {
        super(token, options);

        this.chats = {}

        chatHandler.init(this.chats);

        partials.forEach((partial) => {
            partial.init(this);
        });

        this.setup();
    }

    setup() {
        this.on("message", (msg) => {
            let chatId = msg.from.id;
            let trigger = false;

            if (!(chatId in this.chats)) {
                this.chats[chatId] = {
                    current_state: state.none
                }
            }

            let replays = [];
            let replay = [];
            partials.forEach((partial) => {
                replay = [];
                if (!trigger)
                    [trigger, replay] = partial.run(msg);
                replays.push.apply(replays, replay);
            });

            let wontUse;
            replays.forEach((partial) => {
                [wontUse, replay] = partial.run(msg);
            });

            if (!trigger)
                this.sendMessage(chatId, "Je n'ai pas compris votre demande.");
        });

        this.on('polling_error', (error) => {
            console.log("POLLING ERROR !")
            console.log(error);
        });
    }

    stop() {
        this.stopPolling();
    }

}

module.exports = MyChatBot;