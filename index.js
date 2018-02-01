require("dotenv").config();

const TeleBot = require('telebot');
const request = require("request");

var bot = new TeleBot({ token: process.env.TOKEN });


// USER
var joke = (msg) => {
    if (!canITalk(msg)) {
        return;
    }

    url = "https://08ad1pao69.execute-api.us-east-1.amazonaws.com/dev/random_joke";

    request({
        url: url,
        method: "GET"
    }, function (error, response, body) {
        if (error) throw error;
        var joke = JSON.parse(body);
        msg.reply.text(joke.setup + "\n" + joke.punchline);
    });
}

var welcome = (msg) => {
    msg.reply.text("Hello ! I'm a simple bot.");
}

var help = (msg) => {

    var markup = function (command) {
        reply += command.print + " : " + command.desc + (command.hasOwnProperty("example") ? "\nExample : " + command.example : "") + "\n";
    };

    var reply = "Available commands\n";
    commands.forEach(markup);
    msg.reply.text(reply);
};

var say = (msg, props) => {
    const text = props.match[1];
    return bot.sendMessage(msg.from.id, text, { replyToMessage: msg.message_id });
};

// OTHERS / EVENTS
bot.on("text", (msg) => {

    // TODO Here we're going to parse text to see what user said.
    
});

var userJoined = (msg) => {
    var participant = msg.new_chat_participant;
    msg.reply.text("Bienvenue " + participant.first_name + " (" + participant.username + ")");
};

var userLeft = (msg) => {
    var left = msg.left_chat_member;
    var identity = left.first_name + " " + left.last_name;
    msg.reply.text(identity + " left ! ");
};
// END OTHERS / EVENTS

var commands = [
    { command: "/start", desc: "Start a conversation with the Bot", print: "/start", function: welcome },
    { command: "/welcome", desc: "Start a conversation with the Bot", print: "/welcome", function: welcome },
    { command: "/help", desc: "Print this message", print: "/help", function: help },
    { command: /^\/say (.+)$/, print: "/say {message}", desc: "Say the message passed in parameters", function: say },
    { command: "/joke", print: "/joke", desc: "Tell a joke", function: joke }
];

var eventsAction = [
    { command: "leftChatMember", function: userLeft },
    { command: "newChatMembers", function: userJoined }
]

// Bind events / commands 
var commandSetup = (command) => {
    bot.on(command.command, command.function);
};

eventsAction.forEach(commandSetup);
commands.forEach(commandSetup);

bot.start();