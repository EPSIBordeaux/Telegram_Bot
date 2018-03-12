const state = require("../helper/variables").state;
const regex = require("../helper/variables").regex;
const devQuestions = require("../helper/variables").devQuestions;
const config = require("../helper/variables").config;
let VM = require('vm2').VM;

let bot = undefined;
let currentQuestion = undefined;

module.exports.init = (_bot) => {
    bot = _bot;
};

module.exports.run = function (msg, chats) {
    var chatId = msg.from.id;
    var trigger = true;

    if (!("devQuestionCount" in chats[chatId])) {
        chats[chatId].devQuestionCount = 0;
        chats[chatId].currentQuestion = undefined;
        chats[chatId].scoreDev = 0;
    }

    switch (true) {
        case regex.dev_question.test(msg.text) && chats[chatId].current_state == state.none:
            bot.sendMessage(chatId, "Voici une question de développement, êtes-vous prêt ? (oui/non)");
            chats[chatId].current_state = state.devQuestions.are_you_ready;
            break;
        case chats[chatId].current_state == state.devQuestions.are_you_ready:
            var answer = msg.text;
            if (answer == "oui") {
                chats[chatId].devQuestionCount++;
                // TODO Randomize this. Think to update/find a way to test it !
                chats[chatId].currentQuestion = devQuestions[`${chats[chatId].devQuestionCount}`];
                bot.sendMessage(chatId, chats[chatId].currentQuestion.question);
                chats[chatId].current_state = state.devQuestions.ask_question;
            } else {
                bot.sendMessage(chatId, "Dites moi 'oui' quand vous serez prêt !");
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
                    } catch (err) {}
                    break;
            }

            chats[chatId].scoreDev += correctAnswer ? chats[chatId].currentQuestion.score : 0;
            bot.sendMessage(chatId, (correctAnswer ? "Très bien !" : "Vous avez mal répondu."));
            chats[chatId].currentQuestion = undefined;

            if (chats[chatId].devQuestionCount >= config.askNbDevQuestions) {
                bot.sendMessage(chatId, "Les questions de développement sont maintenant terminées.");
                chats[chatId].current_state = state.none;
            } else {
                bot.sendMessage(chatId, "Prêt pour la question suivante ? (oui/non)");
                chats[chatId].current_state = state.devQuestions.are_you_ready;
            }

            break;
        default:
            trigger = false;
            break;
    }
    return [chats, trigger];
}