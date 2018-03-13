const state = require("../helper/variables").state;
const regex = require("../helper/variables").regex;
const devQuestions = require("../helper/variables").devQuestions;
const config = require("../helper/variables").config;
let VM = require('vm2').VM;

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

    if (!("devQuestionCount" in chats[chatId])) {
        chats[chatId].devQuestionCount = 0;
        chats[chatId].currentQuestion = undefined;
        chats[chatId].scoreDev = 0;
        chats[chatId].answeredQuestions = [];
    }

    switch (true) {
        case regex.dev_question.test(msg.text) && chats[chatId].current_state == state.none:
        case chats[chatId].current_state == state.devQuestions.begin:
            bot.sendMessage(chatId, "Voici une question de développement, êtes-vous prêt ? (oui/non)", {
                "reply_markup": {
                    "keyboard": [["oui"], ["non"]]
                }
            });
            chats[chatId].current_state = state.devQuestions.are_you_ready;
            break;
        case chats[chatId].current_state == state.devQuestions.are_you_ready:
            var answer = msg.text;
            if (answer == "oui") {
                chats[chatId].devQuestionCount++;
                if (chats[chatId].currentQuestion == undefined) {
                    let availableQuestions = [];
                    // Set a new random question. Otherwise, it mean that the tests have set up a specific questions.
                    Object.keys(devQuestions).forEach((element) => {
                        if (chats[chatId].answeredQuestions.indexOf(element) <= -1) {
                            availableQuestions.push(element);
                        }
                    });

                    let randomItem = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
                    chats[chatId].currentQuestion = devQuestions[randomItem];
                    chats[chatId].answeredQuestions.push(randomItem);
                }

                let options = {
                    "reply_markup": {
                        hide_keyboard: true
                    }
                };
                switch (chats[chatId].currentQuestion.answer_type) {
                    case "qcm":
                        options = {
                            "reply_markup": {
                                "keyboard": chats[chatId].currentQuestion.choices.map(x => [x])
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

                bot.sendMessage(chatId, chats[chatId].currentQuestion.question, options);
                chats[chatId].current_state = state.devQuestions.ask_question;

            } else {
                bot.sendMessage(chatId, "Dites moi 'oui' quand vous serez prêt !", {
                    "reply_markup": {
                        "keyboard": [["oui"]]
                    }
                });
            }
            break;
        case chats[chatId].current_state == state.devQuestions.ask_question:
            chats[chatId].current_state = state.devQuestions.got_answer;
            var answer = msg.text;

            let correctAnswer = false;
            switch (chats[chatId].currentQuestion.answer_type) {
                case "boolean":
                    correctAnswer = ((answer == "vrai" && chats[chatId].currentQuestion.answer == true)
                        || (answer == "faux" && chats[chatId].currentQuestion.answer == false));
                    break;
                case "eval":
                    let function_to_test = chats[chatId].currentQuestion.test.function;
                    function_to_test = function_to_test.replace("REPLACE_ME", answer);
                    let expected = chats[chatId].currentQuestion.test.expected;

                    let vm = new VM({
                        timeout: 1000,
                        sandbox: {}
                    });

                    try {
                        let evaluated = vm.run(function_to_test);
                        correctAnswer = (evaluated == expected);
                    } catch (err) { }
                    break;
                case "qcm":
                    correctAnswer = (answer == chats[chatId].currentQuestion.answer);
                    break;
            }

            chats[chatId].scoreDev += correctAnswer ? chats[chatId].currentQuestion.score : 0;
            bot.sendMessage(chatId, (correctAnswer ? "Très bien !" : "Vous avez mal répondu."), {
                "reply_markup": {
                    hide_keyboard: true
                }
            });
            chats[chatId].currentQuestion = undefined;

            if (chats[chatId].devQuestionCount >= config.askNbDevQuestions) {
                bot.sendMessage(chatId, "Les questions de développement sont maintenant terminées.", {
                    "reply_markup": {
                        hide_keyboard: true
                    }
                });
                chats[chatId].current_state = state.networkQuestions.begin;
                replay.push(require('./network_question'));
            } else {
                bot.sendMessage(chatId, "Prêt pour la question suivante ? (oui/non)", {
                    "reply_markup": {
                        "keyboard": [["oui"], ["non"]]
                    }
                });
                chats[chatId].current_state = state.devQuestions.are_you_ready;
            }

            break;
        default:
            trigger = false;
            break;
    }
    return [chats, trigger, replay];
}