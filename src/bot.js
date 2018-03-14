'use strict'

const TelegramBot = require('node-telegram-bot-api')
const chatHandler = require('./helper/chatsHandler')

const { state } = require('./helper/variables')

let { getCurrentState } = require('./helper/chatsHandler')

let identitySwitch = require('./partials/identity')
let devQuestions = require('./partials/dev_question')
let common = require('./partials/common')
let networkQuestions = require('./partials/network_question')
let postQuestions = require('./partials/post_questions')

const partials = [common, identitySwitch, devQuestions, networkQuestions, postQuestions]

class MyChatBot extends TelegramBot {
  constructor (token, options) {
    super(token, options)

    this.chats = {}

    chatHandler.init(this.chats)

    partials.forEach((partial) => {
      partial.init(this)
    })

    this.setup()
  }

  setup () {
    this.on('message', (msg) => {
      let chatId = msg.from.id
      let trigger = false

      if (!(chatId in this.chats)) {
        this.chats[chatId] = {
          current_state: state.none
        }
      }

      let replays = []
      let replay = []
      partials.forEach((partial) => {
        replay = []
        if (!trigger) { [trigger, replay] = partial.run(msg) }
        replays.push.apply(replays, replay)
      })

      replays.forEach((partial) => {
        [replay, replay] = partial.run(msg)
      })

      if (!trigger) {
        this.sendMessage(chatId, "Je n'ai pas compris votre demande.")
        console.log(msg)
        console.log(getCurrentState(chatId))
      }
    })

    this.on('polling_error', (error) => {
      console.log(error)
      throw Error('Polling error')
    })
  }

  stop () {
    this.stopPolling()
  }

  sendMessage (chatId, text, options = {
    'reply_markup': {
      hide_keyboard: true
    }
  }) {
    super.sendMessage(chatId, text, options)
  }
}

module.exports = MyChatBot
