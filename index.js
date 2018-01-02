require("dotenv").config();

const TeleBot = require('telebot');
const request = require("request");

var bot = new TeleBot({
    token: process.env.TOKEN, // Required. Telegram Bot API token.
});

// TODO Admin
/**
 * Add allowedConversation
 * Add admin
 */
// TODO Refacto admin, events & user commands into separate files

// ID of SuperAdmin
var superAdmin = process.env.SUPER_ADMIN;
var admins = [];
var allowedConversations = [];

var settings = {
    spamUsers: [],
    debug: true
};

// FUNCTIONS
var canTalk = function (chat) {
    return chat.id == superAdmin || admins.indexOf(chat.id) != -1 || allowedConversations.indexOf(chat.id) != -1;
}

var shouldHarrass = function (user) {
    return settings.spamUsers.indexOf(String(user.id)) != -1;
}

var isAllowed = function (user) {
    return superAdmin == user.id || admins.indexOf(user.id) != -1;
}

var canITalk = function (msg) {
    if (!canTalk(msg.chat)) {
        msg.reply.text("Can't talk");
        return false;
    }
    return true;
}
// END FUNCTIONS

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

    if (isAllowed(msg.from)) {
        reply = "ADMIN Commands\n";
        adminCommands.forEach(markup);
        bot.sendMessage(msg.from.id, reply);
    }
};

var say = (msg, props) => {
    const text = props.match[1];
    return bot.sendMessage(msg.from.id, text, { replyToMessage: msg.message_id });
};
// END USER

// ADMIN 
var setSetting = (msg, props) => {
    if (!isAllowed(msg.from)) {
        return bot.sendMessage(msg.from.id, "Not allowed", { replyToMessage: msg.message_id });
    }

    var setting = props.match[1];
    var value = props.match[2];

    if (settings.hasOwnProperty(setting)) {
        value = (setting === "debug") ? value == 'true' : value;
        settings[setting] = value;
        msg.reply.text("Settings updated !");
    } else {
        msg.reply.text("Property " + setting + " doesn't exist");
    }
};

var getSettings = (msg) => {

    if (!isAllowed(msg.from)) {
        return bot.sendMessage(msg.from.id, "Not allowed", { replyToMessage: msg.message_id });
    }

    var reply = "";
    Object.keys(settings).forEach(function (key) {
        reply += key + " : " + settings[key] + "\n";
    });

    reply += "To update a settings, type /setting {settings}:{value}\n";

    msg.reply.text(reply);
};
// END ADMIN

// OTHERS / EVENTS
bot.on("text", (msg) => {
    if (settings.debug) {
        console.log(msg);
    }

    // Harrass people :D
    if (shouldHarrass(msg.from)) {
        bot.sendMessage(msg.from.id, "Tocard ! :D", { replyToMessage: msg.message_id });
    }
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

// Declare actions
var adminCommands = [
    { command: /^\/setting (.+):(.+)$/, print: "/setting {setting} {value}", desc: "Update the given setting with the given value", function: setSetting },
    { command: "/settings", print: "/settings", desc: "Show available settings", function: getSettings }
];

var commands = [
    { command: "/start", desc: "Start a conversation with the Bot", print: "/start", function: welcome },
    { command: "/welcome", desc: "Start a conversation with the Bot", print: "/welcome", function: welcome },
    { command: "/help", desc: "Print this message", print: "/help", function: help },
    { command: /^\/say (.+)$/, print: "/say {message}", desc: "Say the message passed in parameters", function: say },
    { command: "/blague", print: "/blague", desc: "Tell a joke", function: joke }
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
adminCommands.forEach(commandSetup);

bot.start();