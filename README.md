# Telegram_Bot

Projet EPSI - Chatbot

[![CircleCI](https://circleci.com/gh/BinomeEPSI/Telegram_Bot/tree/master.svg?style=svg&circle-token=bc0dcd04151af502a6891e8f392a24c192a34eaf)](https://circleci.com/gh/BinomeEPSI/Telegram_Bot/tree/master)
[![Depfu](https://badges.depfu.com/badges/87ebc6dff6cd6c56b949616bf58c36c8/overview.svg)](https://depfu.com/github/BinomeEPSI/Telegram_Bot)
[![License: MIT](https://img.shields.io/badge/Lcense-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://codecov.io/gh/BinomeEPSI/Telegram_Bot/branch/master/graph/badge.svg)](https://codecov.io/gh/BinomeEPSI/Telegram_Bot)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![https://telegram.me/EPSI_UsainBot](https://img.shields.io/badge/%F0%9F%92%AC-EPSI__UsainBot-blue.svg)](https://telegram.me/EPSI_UsainBot)
![GitHub release](https://img.shields.io/github/release/BinomeEPSI/Telegram_Bot.svg)

## Talk to the bot

[![https://telegram.me/EPSI_UsainBot](https://img.shields.io/badge/%F0%9F%92%AC-EPSI__UsainBot-blue.svg)](https://telegram.me/EPSI_UsainBot)

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

To run linter with auto-fix : `npm run lint:fix`

## Create a bot

[Talk to @BotFather](https://core.telegram.org/bots#3-how-do-i-create-a-bot)

## Run

### Tests

`npm test`

### Bot (local development)

It is recommended to have a separate test bot account from your production bot so that you don't get 2 answers each time you talk to the bot.

`npm start`

### Production

Set `WEBHOOK_URL` and run application with `production` environment.

Then, you'll need a reverse proxy (such as nginx or caddy for example) to proxy request from `WEBOOK_URL` to your application.