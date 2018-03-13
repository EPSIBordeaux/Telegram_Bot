const state = require("../helper/variables").state;
const regex = require("../helper/variables").regex;
const networkQuestions = require("../helper/variables").networkQuestions;
const config = require("../helper/variables").config;

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

    if (!("networkQuestionCount" in chats[chatId])) {
        chats[chatId].networkQuestionCount = 0;
        chats[chatId].currentQuestionNetwork = undefined;
        chats[chatId].scoreNetwork = 0;
        chats[chatId].answeredNetworkQuestions = [];
    }

    switch (true) {
        case regex.network_question.test(msg.text) && chats[chatId].current_state == state.none:
        case chats[chatId].current_state == state.networkQuestions.begin:
            bot.sendMessage(chatId, "Voici une question de réseau, êtes-vous prêt ? (oui/non)", {
                "reply_markup": {
                    "keyboard": [["oui"], ["non"]]
                }
            });
            chats[chatId].current_state = state.networkQuestions.are_you_ready;
            break;
        case chats[chatId].current_state == state.networkQuestions.are_you_ready:
            var answer = msg.text;
            if (answer == "oui") {
                chats[chatId].networkQuestionCount++;
                if (chats[chatId].currentQuestionNetwork == undefined) {
                    let availableQuestions = [];
                    // Set a new random question. Otherwise, it mean that the tests have set up a specific questions.
                    Object.keys(networkQuestions).forEach((element) => {
                        if (chats[chatId].answeredNetworkQuestions.indexOf(element) <= -1) {
                            availableQuestions.push(element);
                        }
                    });

                    let randomItem = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
                    chats[chatId].currentQuestionNetwork = networkQuestions[randomItem];
                    chats[chatId].answeredNetworkQuestions.push(randomItem);
                }

                let options = {
                    "reply_markup": {
                        hide_keyboard: true
                    }
                };
                switch (chats[chatId].currentQuestionNetwork.answer_type) {
                    case "qcm":
                        options = {
                            "reply_markup": {
                                "keyboard": chats[chatId].currentQuestionNetwork.choices.map(x => [x])
                            }
                        }
                        break;
                    case "boolean":
                        options = {
                            "reply_markup": {
                                "keyboard": [["vrai"], ["faux"]]
                            }
                        }
                        break;
                }

                bot.sendMessage(chatId, chats[chatId].currentQuestionNetwork.question, options);
                chats[chatId].current_state = state.networkQuestions.ask_question;

            } else {
                bot.sendMessage(chatId, "Dites moi 'oui' quand vous serez prêt !", {
                    "reply_markup": {
                        "keyboard": [["oui"]]
                    }
                });
            }
            break;
        case chats[chatId].current_state == state.networkQuestions.ask_question:
            chats[chatId].current_state = state.networkQuestions.got_answer;
            var answer = msg.text;

            let correctAnswer = false;
            switch (chats[chatId].currentQuestionNetwork.answer_type) {
                case "boolean":
                    correctAnswer = ((answer == "vrai" && chats[chatId].currentQuestionNetwork.answer == true)
                        || (answer == "faux" && chats[chatId].currentQuestionNetwork.answer == false));
                    break;
                case "qcm":
                    correctAnswer = (answer == chats[chatId].currentQuestionNetwork.answer);
                    break;
            }

            chats[chatId].scoreNetwork += correctAnswer ? chats[chatId].currentQuestionNetwork.score : 0;
            bot.sendMessage(chatId, (correctAnswer ? "Très bien !" : "Vous avez mal répondu."), {
                "reply_markup": {
                    hide_keyboard: true
                }
            });
            chats[chatId].currentQuestionNetwork = undefined;

            if (chats[chatId].networkQuestionCount >= config.askNbNetworkQuestions) {
                bot.sendMessage(chatId, "Les questions de réseau sont maintenant terminées.", {
                    "reply_markup": {
                        hide_keyboard: true
                    }
                });
                chats[chatId].current_state = state.none;
            } else {
                bot.sendMessage(chatId, "Prêt pour la question suivante ? (oui/non)", {
                    "reply_markup": {
                        "keyboard": [["oui"], ["non"]]
                    }
                });
                chats[chatId].current_state = state.networkQuestions.are_you_ready;
            }

            break;
        default:
            trigger = false;
            break;
    }
    return [chats, trigger, replay];
}