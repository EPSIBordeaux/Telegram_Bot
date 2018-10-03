const { state, devQuestions, networkQuestions, config } = require('../helper/variables')
let VM = require('vm2').VM

module.exports.handleQuestions = (isDevQuestion, count, currentQuestion, score, answeredQuestions, regexElement, bot, msg, chats) => {
  let stateSuffix = isDevQuestion ? 'devQuestions' : 'networkQuestions'
  let questions = isDevQuestion ? devQuestions : networkQuestions
  let keyword = isDevQuestion ? 'développement' : 'réseau'
  let replay = []
  let trigger = true
  let id = msg.from.id
  let answer = ''

  switch (true) {
    case regexElement.test(msg.text) && chats[`${id}`].current_state === state.none && process.env.NODE_ENV === 'test':
    case chats[`${id}`].current_state === state[stateSuffix].begin:
      bot.stackMessage(id, `Voici une question de ${keyword}, êtes-vous prêt ? (oui/non)`, {
        'reply_markup': {
          'keyboard': [['oui'], ['non']]
        }
      })
      chats[`${id}`].current_state = state[stateSuffix].are_you_ready
      break
    case chats[`${id}`].current_state === state[stateSuffix].are_you_ready:
      answer = msg.text.toLowerCase()
      if (answer === 'oui') {
        chats[`${id}`][count] += 1
        if (chats[`${id}`][currentQuestion] === undefined) {
          let availableQuestions = []
          // Set a new random question. Otherwise, it mean that the tests have set up a specific questions.
          Object.keys(questions).forEach((element) => {
            if (chats[`${id}`][answeredQuestions].indexOf(element) <= -1) {
              availableQuestions.push(element)
            }
          })

          let randomItem = availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
          chats[`${id}`][currentQuestion] = questions[randomItem]
          chats[`${id}`][answeredQuestions].push(randomItem)
        }

        let options = {}
        switch (chats[`${id}`][currentQuestion].answer_type) {
          case 'qcm':
            options = {
              'reply_markup': {
                'keyboard': chats[`${id}`][currentQuestion].choices.map(x => [x])
              }
            }
            break
          case 'boolean':
            options = {
              'reply_markup': {
                'keyboard': [['vrai'], ['faux']]
              }
            }
            break
        }

        bot.stackMessage(id, chats[`${id}`][currentQuestion].question, options)
        chats[`${id}`].current_state = state[stateSuffix].ask_question
      } else {
        bot.stackMessage(id, "Dites moi 'oui' quand vous serez prêt !", {
          'reply_markup': {
            'keyboard': [['oui']]
          }
        })
      }
      break
    case chats[`${id}`].current_state === state[stateSuffix].ask_question:
      chats[`${id}`].current_state = state[stateSuffix].got_answer
      answer = msg.text

      let correctAnswer = false
      switch (chats[`${id}`][currentQuestion].answer_type) {
        case 'boolean':
          let questionAnswer = chats[`${id}`][currentQuestion].answer
          correctAnswer = ((answer === 'vrai' && questionAnswer === true) ||
                        (answer === 'faux' && questionAnswer === false))
          break
        case 'eval':
          let functionToTest = chats[`${id}`][currentQuestion].test.function
          functionToTest = functionToTest.replace('REPLACE_ME', answer)
          let expected = chats[`${id}`][currentQuestion].test.expected

          let vm = new VM({
            timeout: 1000,
            sandbox: {}
          })

          try {
            let evaluated = vm.run(functionToTest)
            correctAnswer = (evaluated === expected)
          } catch (err) { }
          break
        case 'qcm':
          correctAnswer = (answer === chats[`${id}`][currentQuestion].answer)
          break
      }

      chats[`${id}`][score] += correctAnswer ? chats[`${id}`][currentQuestion].score : 0
      bot.stackMessage(id, (correctAnswer ? 'Très bien !' : 'Vous avez mal répondu.'))
      chats[`${id}`][currentQuestion] = undefined

      if (chats[`${id}`][count] >= (isDevQuestion ? config.askNbDevQuestions : config.askNbNetworkQuestions)) {
        let message = isDevQuestion ? 'Les questions de développement sont maintenant terminées.' : 'Les questions de réseau sont maintenant terminées.'
        bot.stackMessage(id, message)

        if (isDevQuestion) {
          chats[`${id}`].current_state = state.networkQuestions.begin
          replay.push(require('../partials/network_question'))
        } else {
          chats[`${id}`].current_state = state.postQuestions.begin
          replay.push(require('../partials/post_questions'))
        }
      } else {
        bot.stackMessage(id, 'Prêt pour la question suivante ? (oui/non)', {
          'reply_markup': {
            'keyboard': [['oui'], ['non']]
          }
        })
        chats[`${id}`].current_state = state[stateSuffix].are_you_ready
      }

      break
    default:
      trigger = false
      break
  }
  return [trigger, replay, chats]
}
