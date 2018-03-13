let { handleQuestions } = require("../helper/questionsHandler");

const state = require("../helper/variables").state;
const regex = require("../helper/variables").regex;
const networkQuestions = require("../helper/variables").networkQuestions;
const config = require("../helper/variables").config;

let bot = undefined;

module.exports.init = (_bot) => {
    bot = _bot;
};

module.exports.getName = () => {
    return __filename;
}

module.exports.run = function (msg) {
    return handleQuestions(false, "networkQuestionCount", "currentQuestionNetwork", "scoreNetwork", "answeredNetworkQuestions", regex.network_question, bot, msg);
}