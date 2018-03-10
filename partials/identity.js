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
        // IDENTITY 
        case regex.firstname.test(msg.text) && chats[chatId].current_state == state.none:
            bot.sendMessage(chatId, "Quel est votre nom ?");
            chats[chatId].current_state = state.identity.name_asked;
            break;
        case chats[chatId].current_state == state.identity.name_asked:
            var name = msg.text;
            bot.sendMessage(chatId, `Votre nom est '${name}'. Est-ce correct ? (oui/non)`)
            chats[chatId].current_state = state.identity.name_received;
            break;
        case chats[chatId].current_state == state.identity.name_received:
            var answer = msg.text;

            if (answer == "oui") {
                bot.sendMessage(chatId, "Très bien, quel est votre prénom ?");
                chats[chatId].current_state = state.identity.firstname_asked;
            } else {
                // TODO Test this case.
                bot.sendMessage(chatId, "Zut ! Recommençons. Donnez-moi votre nom.");
                chats[chatId].current_state = state.identity.name_asked;
            }
            break;
        case chats[chatId].current_state == state.identity.firstname_asked:
            var firstname = msg.text;
            bot.sendMessage(chatId, `Votre prénom est '${firstname}'. Est-ce correct ? (oui/non)`);
            chats[chatId].current_state = state.identity.firstname_received;
            break;
        case chats[chatId].current_state == state.identity.firstname_received:
            var answer = msg.text;

            if (answer == "oui") {
                bot.sendMessage(chatId, "Parfait !");
                chats[chatId].current_state = state.none;
            } else {
                // TODO Test this case.
                bot.sendMessage(chatId, "Zut ! Recommençons. Donnez-moi votre prénom.");
                chats[chatId].current_state = state.identity.firstname_asked;
            }
            break;
        // END IDENTITY
        default:
            trigger = false;
            break;
    }
    return [chats, trigger];
}