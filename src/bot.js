'use strict'

const TelegramBot = require('node-telegram-bot-api')

const { state } = require('./helper/variables')

let identitySwitch = require('./partials/identity')
let devQuestions = require('./partials/dev_question')
let common = require('./partials/common')
let networkQuestions = require('./partials/network_question')
let postQuestions = require('./partials/post_questions')
const Promise = require('bluebird')

const partials = [common, identitySwitch, devQuestions, networkQuestions, postQuestions]

class MyChatBot extends TelegramBot {
  constructor (token, options) {
    super(token, options)

    this.chats = {}

    partials.forEach((partial) => {
      partial.init(this)
    })

    this.setup()
  }

  setup () {
    this.on('message', (msg) => {
      let chatId = msg.from.id
      let trigger = false

      if (process.env.NODE_ENV === 'development') { console.log('\x1b[1;104m', msg.text, '\x1b[0m') }

      if (!(chatId in this.chats)) {
        this.reset(chatId)
      }

      let replays = []
      let replay = []
      partials.forEach((partial) => {
        replay = []
        if (!trigger) { [trigger, replay, this.chats] = partial.run(msg, this.chats) }
        replays.push.apply(replays, replay)
      })

      replays.forEach((partial) => {
        [replay, replay, this.chats] = partial.run(msg, this.chats)
      })

      if (!trigger) {
        this.stackMessage(chatId, "Je n'ai pas compris votre demande.")
        console.log(msg)
        console.log(this.chats[chatId].current_state)
      }

      this.flush(chatId)
    })

    this.on('polling_error', (error) => {
      throw Error(error)
    })
  }

  stop () {
    this.stopPolling()
  }

  reset (chatId) {
    this.chats[chatId] = {
      current_state: state.none,
      queue: [],
      devQuestionCount: 0,
      networkQuestionCount: 0,
      currentQuestion: undefined,
      currentQuestionNetwork: undefined,
      scoreDev: 0,
      scoreNetwork: 0,
      answeredQuestions: [],
      answeredNetworkQuestions: []
    }
  }

  stackMessage (chatId, text, options = {
    'reply_markup': {
      hide_keyboard: true
    }
  }) {
    this.chats[chatId].queue.push({chatId: chatId, text: text, options: options})
  }

  flush (chatId) {
    let that = this
    let queue = this.chats[`${chatId}`].queue

    if (queue === undefined) {
      console.log(this.chats[`${chatId}`])
      throw Error('Queue is undefined !')
    }

    if (queue === []) {
      throw Error('Queue cannot be empty !')
    }

    // console.log(queue)
    return Promise.mapSeries(queue, (element) => {
      if (process.env.NODE_ENV === 'development') { console.log('\x1b[1;45m', element.text, '\x1b[0m') }
      // console.log(element.text.length)
      return that.sendMessage(element.chatId, element.text, element.options)
        .catch((error) => {
          throw error
        })
    }).then(() => {
      this.chats[`${chatId}`].queue = []
    })
  }
}

module.exports = MyChatBot
