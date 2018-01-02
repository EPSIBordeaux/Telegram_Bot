const TeleBot = require('telebot');

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

bot.on('text', (msg) => msg.reply.text(msg.text));

bot.on("/bonjour", (msg) => msg.reply.text("Hello !"));

bot.start();