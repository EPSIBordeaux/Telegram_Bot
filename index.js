require("dotenv").config();

const TeleBot = require('telebot');
const request = require("request");

var bot = new TeleBot({ token: process.env.TOKEN });

class Chat {
    constructor(id, name) {
        this.name = name;
        this.id = id;
        this.members = [];
    }

    addChatMember(member) {
        this.members.push(member);
    }

    getId() {
        return this.id;
    }

    getMembers() {
        return this.members;
    }
}

// TODO Refacto admin, events & user commands into separate files

var superAdmin = process.env.SUPER_ADMIN;
var admins = [];
var allowedConversations = [];

// List of chat I'm present in
var listOfChats = [];
var settings = {
    spamUsers: [],
    debug: true
};

// FUNCTIONS
var canTalk = function (chat) {
    return chat.id == superAdmin || admins.indexOf(String(chat.id)) != -1 || allowedConversations.indexOf(String(chat.id)) != -1;
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
var createReplyForChat = (element) => {
    bot.getChat(element).then((chat) => {
        if (chat.type == "private") {
            reply += String(chat.id) + " " + chat.username;
        } else if (["group", "supergroup", "channel"].indexOf(chat.type) != -1) {
            reply += String(chat.id) + " " + chat.title;
        }
        reply += "\n";
    });
};

var getAllowedChats = (msg) => {
    reply = "";

    if (allowedConversations.length === 0) {
        reply = "No allowed conversation, I can only talk to you and the admins.";
    }

    allowedConversations.forEach(createReplyForChat);
    msg.reply.text(reply);
};

var addAllowedConversation = (msg, props) => {
    var id = props.match[1]; // Id or @groupname

    bot.getChat(id)
        .then((chat) => {
            allowedConversations.push(id);
            msg.reply.text("Conversations allowed updated ! ");
        })
        .catch(err => {
            msg.reply.text("Can't find this chat !");
        });
};

var getAdmins = (msg) => {
    reply = "";
    if (admins.length === 0) {
        reply = "No admin, only super admin is defined";
    }

    admins.forEach(createReplyForChat);
    msg.reply.text(reply);
};

var addAdmin = (msg, props) => {
    var id = parseInt(props.match[1]);

    bot.getChatMember(msg.chat.id, id)
        .then((user) => {
            user = user.result.user;
            admins.push(user.id);
            _ = bot.sendMessage(id, "You have been promoted admin for @EPSI_UsainBot");
            msg.reply.text("User promoted to admin !");
        })
        .catch(err => {
            console.log(err);
            msg.reply.text("This user doesn't exist");
        });
};

var spamUser = (msg, props) => {
    var id = parseInt(props.match[1]);
    bot.getChatMember(msg.chat.id, id)
        .then((user) => {
            user = user.result.user;
            settings.spamUsers.push(String(user.id));
            msg.reply.text("User added to spam users !");
        })
        .catch(err => {
            msg.reply.text("This user doesn't exist");
        });
};

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

var showPresence = (msg) => {

    listOfChats.forEach((element) => {
        element.getMembers().forEach(userID => {
            reply = "";
            bot.getChatMember(element.getId(), userID).then(user => {
                user = user.result.user;
                reply += "Chat (" + element.getId() + ") :" + element.name + " => \t(" + user.id + ") - " + user.username + "\n";
                msg.reply.text(reply);
            });
        });
    });
};
// END ADMIN

var updateChats = (msg) => {
    var chatId = msg.chat.id;
    var chatName;

    if (msg.chat.hasOwnProperty("title")) {
        chatName = msg.chat.title;
    } else {
        chatName = msg.chat.username;
    }

    var shouldAdd = true;
    var memberId = msg.from.id;
    listOfChats.forEach(element => {
        if (element.id === chatId) {
            shouldAdd = false;
        }
    });

    if (shouldAdd) {
        var chat = new Chat(chatId, chatName);
        chat.addChatMember(memberId);
        listOfChats.push(chat);
    } else {
        var chat = listOfChats.filter(element => element.id == chatId)[0];

        if (chat.getMembers().indexOf(memberId) == -1) {
            chat.addChatMember(memberId);
        }
    }
};

// OTHERS / EVENTS
bot.on("text", (msg) => {
    if (settings.debug) {
        //console.log(msg);
    }

    updateChats(msg);

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
    { command: "/settings", print: "/settings", desc: "Show available settings", function: getSettings },
    { command: "/chats", print: "/chats", desc: "List the allowed chat", function: getAllowedChats },
    { command: "/presence", print: "/presence", desc: "Show me where bot is present", function: showPresence },
    { command: /^\/chat (.+)$/, print: "/chat {id or @channel}", desc: "Add a conversation to trusted one", function: addAllowedConversation },
    { command: "/admins", print: "/admins", desc: "List admins", function: getAdmins },
    { command: /^\/admin (.+)$/, print: "/admin {id}", desc: "Add admin", function: addAdmin },
    { command: /^\/spam (.+)$/, print: "/spam {id}", desc: "Spam user", function: spamUser }
];

var commands = [
    { command: "/start", desc: "Start a conversation with the Bot", print: "/start", function: welcome },
    { command: "/welcome", desc: "Start a conversation with the Bot", print: "/welcome", function: welcome },
    { command: "/help", desc: "Print this message", print: "/help", function: help },
    { command: /^\/say (.+)$/, print: "/say {message}", desc: "Say the message passed in parameters", function: say },
    { command: "/joke", print: "/blague", desc: "Tell a joke", function: joke }
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