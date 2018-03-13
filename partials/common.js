const state = require("../helper/variables").state;
const regex = require("../helper/variables").regex;

let bot = undefined;
let chats = undefined;

module.exports.init = (_bot, _chats) => {
    bot = _bot;
    chats = _chats;
};

module.exports.getName = () => {
    return __filename;
}

module.exports.run = function (msg) {
    var chatId = msg.from.id;
    var trigger = true;
    let replay = [];

    switch (true) {
        case regex.start.test(msg.text) && chats[chatId].current_state == state.none:
            bot.sendMessage(chatId, "Bonjour !\nJe me présente, je suis un petit bot de recrutement.\nSi vous le souhaitez, je vais vous poser quelques questions afin de voir quel poste pourrait vous convenir. Êtes-vous prêt ?", {
                "reply_markup": {
                    "keyboard": [["oui"], ["non"]]
                }
            });
            chats[chatId].current_state = state.onBoarding.asked;
            break;
        case chats[chatId].current_state == state.onBoarding.asked:
            var answer = msg.text;

            let response = "";
            let options = {
                "reply_markup": {
                    hide_keyboard: true
                }
            }
            if (answer == "oui") {
                response = "Parfait, commençons !";
                chats[chatId].current_state = state.devQuestions.begin;
                replay.push(require("./dev_question"));
            } else {
                response = "Très bien, dites moi 'oui' quand vous serez prêt !";
                options = {
                    "reply_markup": {
                        "keyboard": [["oui"], ["non"]]
                    }
                }
            }

            bot.sendMessage(chatId, response, options);

            break;
        case regex.parrot.test(msg.text) && chats[chatId].current_state == state.none:
            var match = regex.parrot.exec(msg.text);
            const text = match[1];
            bot.sendMessage(chatId, text);
            break;
        case regex.hello.test(msg.text) && chats[chatId].current_state == state.none:
            bot.sendMessage(chatId, "Bonjour !");
            break;
        default:
            trigger = false;
            break;
    }
    return [chats, trigger, replay];
}