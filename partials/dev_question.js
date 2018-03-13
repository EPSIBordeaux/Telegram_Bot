let { handleQuestions } = require("../helper/questionsHandler");

let { getChat, setChat, getCurrentState, setCurrentState, incr, getAttr, pushItem } = require("../helper/chatsHandler");

const state = require("../helper/variables").state;
const regex = require("../helper/variables").regex;
const devQuestions = require("../helper/variables").devQuestions;
const config = require("../helper/variables").config;
let VM = require('vm2').VM;

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