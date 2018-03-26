# Telegram_Bot

Projet EPSI - Chatbot

[![CircleCI](https://circleci.com/gh/sylvainmetayer/Telegram_Bot.svg?style=svg&circle-token=bc0dcd04151af502a6891e8f392a24c192a34eaf)](https://circleci.com/gh/sylvainmetayer/Telegram_Bot) 
[![Depfu](https://badges.depfu.com/badges/b314c580f48dc20e650a666550951169/overview.svg)](https://depfu.com/repos/sylvainmetayer/Telegram_Bot) 
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) 
[![codecov](https://codecov.io/gh/sylvainmetayer/Telegram_Bot/branch/master/graph/badge.svg)](https://codecov.io/gh/sylvainmetayer/Telegram_Bot) 
[![Inline docs](http://inch-ci.org/github/sylvainmetayer/Telegram_Bot.svg?branch=master)](http://inch-ci.org/github/sylvainmetayer/Telegram_Bot) 
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![https://telegram.me/EPSI_UsainBot](https://img.shields.io/badge/%F0%9F%92%AC-EPSI__UsainBot-blue.svg)](https://telegram.me/EPSI_UsainBot)
![GitHub release](https://img.shields.io/github/release/sylvainmetayer/Telegram_Bot.svg)


## Talk to the bot 

[![https://telegram.me/EPSI_UsainBot](https://img.shields.io/badge/%F0%9F%92%AC-EPSI__UsainBot-blue.svg)](https://telegram.me/EPSI_UsainBot)  https://t.me/EPSI_UsainBot

## Installation

```bash
npm install
cp .env.sample .env
vim .env
# Fill TOKEN variable.
```

### Linter

This project use [StandardJS](https://standardjs.com) as linter with a pre-commit hook.

To configure text editor, see [this link](https://standardjs.com/#are-there-text-editor-plugins).

To run linter : `npm run lint`

To run linter with auto-fix : `npm run lint-fix`

## Create a bot

[Talk to @BotFather](https://core.telegram.org/bots#3-how-do-i-create-a-bot)

## Run

### Tests

`npm test`

### Bot (local development)

It is recommended to have a separate test bot account from your production bot so that you don't get 2 answers each time you talk to the bot.

`npm start`
