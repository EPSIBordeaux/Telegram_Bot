const state = require("../helper/variables").state;
const regex = require("../helper/variables").regex;

let bot = undefined;

module.exports.init = (_bot) => {
    bot = _bot;
};

module.exports.run = function (msg, chats) {
    var chatId = msg.from.id;
    var trigger = true;

    switch (true) {
        case regex.start.test(msg.text) && chats[chatId].current_state == state.none:
            bot.sendMessage(chatId, "Bonjour !");
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
    return [chats, trigger];
}