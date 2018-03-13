let { getCurrentState, setCurrentState } = require("../helper/chatsHandler");

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
        case regex.start.test(msg.text) && getCurrentState(id) == state.none:
            bot.sendMessage(id, "Bonjour !\nJe me présente, je suis un petit bot de recrutement.\nSi vous le souhaitez, je vais vous poser quelques questions afin de voir quel poste pourrait vous convenir. Êtes-vous prêt ?", {
                "reply_markup": {
                    "keyboard": [["oui"], ["non"]]
                }
            });
            setCurrentState(id, state.onBoarding.asked);
            break;
        case getCurrentState(id) == state.onBoarding.asked:
            var answer = msg.text;

            let response = "";
            let options = {}
            if (answer == "oui") {
                response = "Parfait, commençons !";
                setCurrentState(id, state.devQuestions.begin);
                replay.push(require("./dev_question"));
            } else {
                response = "Très bien, dites moi 'oui' quand vous serez prêt !";
                options = {
                    "reply_markup": {
                        "keyboard": [["oui"], ["non"]]
                    }
                }
            }

            bot.sendMessage(id, response, options);

            break;
        case regex.parrot.test(msg.text) && getCurrentState(id) == state.none:
            var match = regex.parrot.exec(msg.text);
            const text = match[1];
            bot.sendMessage(id, text);
            break;
        case regex.hello.test(msg.text) && getCurrentState(id) == state.none:
            bot.sendMessage(id, "Bonjour !");
            break;
        default:
            trigger = false;
            break;
    }
    return [trigger, replay];
}