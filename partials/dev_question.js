const state = require("../helper/variables").state;
const regex = require("../helper/variables").regex;
const devQuestions = require("../helper/variables").devQuestions;
const config = require("../helper/variables").config;

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
    }

    switch (true) {
        case regex.dev_question.test(msg.text) && chats[chatId].current_state == state.none:
            bot.sendMessage(chatId, "Voici une question de développement, êtes-vous prêt ? (oui/non)");
            chats[chatId].current_state = state.devQuestions.are_you_ready;
            break;
        case chats[chatId].current_state == state.devQuestions.are_you_ready:
            var answer = msg.text;
            chats[chatId].devQuestionCount++;
            if (answer == "oui") {
                chats[chatId].currentQuestion = devQuestions["1"];
                bot.sendMessage(chatId, chats[chatId].currentQuestion.question);
                chats[chatId].current_state = state.devQuestions.ask_question;
            } else {
                // FIXME Untested
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
            }

            chats[chatId].currentQuestion = undefined;
            bot.sendMessage(chatId, (correctAnswer ? "Très bien !" : "Vous avez mal répondu."));

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