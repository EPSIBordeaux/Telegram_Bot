const TeleBot = require('telebot');
const request = require("request");

const bot = new TeleBot({
    token: process.env.TOKEN, // Required. Telegram Bot API token.
});

// TODO List available commands
commands = [
    { command: "/start", desc: "Start a conversation with the Bot" },
    { command: "/welcome", desc: "Start a conversation with the Bot" },
    { command: "/help", desc: "Print this message" },
    { command: "/say {message}", desc: "Say the message passed in parameters" },
    { command: "/joke", desc: "Tell a joke" },
]

bot.on("*", (msg) => {
    // Log every message
    //console.log(msg)
});

bot.on(["/start", "/welcome"], (msg) => msg.reply.text("Hello ! I'm a simple bot."));

bot.on("/help", (msg) => {
    var reply = "";
    commands.forEach(function (command) {
        reply += command.command + " : " + command.desc + "\n";
    });
    msg.reply.text(reply);
});

bot.on(/^\/say (.+)$/, (msg, props) => {
    const text = props.match[1];
    return bot.sendMessage(msg.from.id, text, { replyToMessage: msg.message_id });
});

bot.on("/joke", (msg) => {
    url = "https://08ad1pao69.execute-api.us-east-1.amazonaws.com/dev/random_joke";

    request({
        url: url,
        method: "GET"
    }, function (error, response, body) {
        if (error) throw error;
        var joke = JSON.parse(body);
        msg.reply.text(joke.setup + "\n" + joke.punchline);
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