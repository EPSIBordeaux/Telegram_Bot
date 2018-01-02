const TeleBot = require('telebot');
const request = require("request");

const bot = new TeleBot({
    token: process.env.TOKEN, // Required. Telegram Bot API token.
    polling: { // Optional. Use polling.
        interval: 1000, // Optional. How often check updates (in ms).
        timeout: 0, // Optional. Update polling timeout (0 - short polling).
        limit: 100, // Optional. Limits the number of updates to be retrieved.
        retryTimeout: 5000, // Optional. Reconnecting timeout (in ms).
    },
    allowedUpdates: [], // Optional. List the types of updates you want your bot to receive. Specify an empty list to receive all updates.
    usePlugins: [], // Optional. Use user plugins from pluginFolder.
});

bot.on(["/start", "/welcome"], (msg) => msg.reply.text("Hello ! I'm a simple bot."));

bot.on("/joke", (msg) => {
    url = "https://api.chucknorris.io/jokes/random";

    request({
        url: url,
        method: "GET",

    }, function (error, response, body ) {
        if (error) throw error;
        msg.reply.text(JSON.parse(body).value);
    });
});

bot.on("newChatMembers", (msg) => {
    var participant = msg.new_chat_participant;
    console.log(participant);
    msg.reply.text("Bienvenue " + participant.first_name + " (" + participant.username + ")");
});

bot.on("leftChatMember", (msg) => {
    var left = msg.left_chat_member;
    var identity = left.first_name + " " + left.last_name;
    msg.reply.text(identity + " left ! ");
})

bot.start();