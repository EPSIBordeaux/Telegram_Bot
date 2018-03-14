let { setCurrentState, getCurrentState } = require("../helper/chatsHandler");

const state = require("../helper/variables").state;
const regex = require("../helper/variables").regex;

let bot = undefined;

module.exports.init = (_bot) => {
    bot = _bot;
};

module.exports.getName = () => {
    return __filename;
}

module.exports.run = function (msg) {
    var id = msg.from.id;
    var trigger = true;
    let replay = [];

    switch (true) {
        case regex.identity.test(msg.text) && getCurrentState(id) == state.none:
        case getCurrentState(id) == state.identity.begin:
            bot.sendMessage(id, "Quel est votre nom ?");
            setCurrentState(id, state.identity.name_asked)
            break;
        case getCurrentState(id) == state.identity.name_asked:
            var name = msg.text;
            bot.sendMessage(id, `Votre nom est '${name}'. Est-ce correct ? (oui/non)`, {
                "reply_markup": {
                    "keyboard": [["oui"], ["non"]]
                }
            })
            setCurrentState(id, state.identity.name_received)
            break;
        case getCurrentState(id) == state.identity.name_received:
            var answer = msg.text;

            if (answer == "oui") {
                bot.sendMessage(id, "Très bien, quel est votre prénom ?");
                setCurrentState(id, state.identity.firstname_asked)
            } else {
                // TODO Test this case.
                bot.sendMessage(id, "Zut ! Recommençons. Donnez-moi votre nom.");
                setCurrentState(id, state.identity.name_asked);
            }
            break;
        case getCurrentState(id) == state.identity.firstname_asked:
            var firstname = msg.text;
            bot.sendMessage(id, `Votre prénom est '${firstname}'. Est-ce correct ? (oui/non)`, {
                "reply_markup": {
                    "keyboard": [["oui"], ["non"]]
                }
            });
            setCurrentState(id, state.identity.firstname_received)
            break;
        case getCurrentState(id) == state.identity.firstname_received:
            var answer = msg.text;

            if (answer == "oui") {
                bot.sendMessage(id, "Parfait !");
                setCurrentState(id, state.none);
            } else {
                // TODO Test this case.
                bot.sendMessage(id, "Zut ! Recommençons. Donnez-moi votre prénom.");
                setCurrentState(id, state.identity.firstname_asked);
            }
            break;
        default:
            trigger = false;
            break;
    }
    return [trigger, replay];
}