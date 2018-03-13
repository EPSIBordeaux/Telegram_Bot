let { handleQuestions } = require("../helper/questionsHandler");

const regex = require("../helper/variables").regex;

let bot = undefined;

module.exports.init = (_bot) => {
    bot = _bot;
};

module.exports.getName = () => {
    return __filename;
}

module.exports.run = function (msg) {
    return handleQuestions(true, "devQuestionCount", "currentQuestion", "scoreDev", "answerdQuestions", regex.dev_question, bot, msg)
}