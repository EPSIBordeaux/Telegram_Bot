let { getChat, setChat, getCurrentState, setCurrentState, incr, getAttr, pushItem } = require('../helper/chatsHandler')

const {state, devQuestions, networkQuestions, config} = require('../helper/variables')
let VM = require('vm2').VM

module.exports.handleQuestions = (isDevQuestion, count, currentQuestion, score, answeredQuestions, regexElement, bot, msg) => {
  let stateSuffix = isDevQuestion ? 'devQuestions' : 'networkQuestions'
  let questions = isDevQuestion ? devQuestions : networkQuestions
  let keyword = isDevQuestion ? 'développement' : 'réseau'
  let replay = []
  let trigger = true
  let id = msg.from.id
  let answer = ''

  if (!(count in getChat(id))) {
    setChat(id, count, 0)
    setChat(id, currentQuestion, undefined)
    setChat(id, score, 0)
    setChat(id, answeredQuestions, [])
  }

  switch (true) {
    case regexElement.test(msg.text) && getCurrentState(id) === state.none:
    case getCurrentState(id) === state[stateSuffix].begin:
      bot.sendMessage(id, `Voici une question de ${keyword}, êtes-vous prêt ? (oui/non)`, {
        'reply_markup': {
          'keyboard': [['oui'], ['non']]
        }
      })
      setCurrentState(id, state[stateSuffix].are_you_ready)
      break
    case getCurrentState(id) === state[stateSuffix].are_you_ready:
      answer = msg.text
      if (answer === 'oui') {
        incr(id, count)
        if (getAttr(id, currentQuestion) === undefined) {
          let availableQuestions = []
          // Set a new random question. Otherwise, it mean that the tests have set up a specific questions.
          Object.keys(questions).forEach((element) => {
            if (getAttr(id, answeredQuestions).indexOf(element) <= -1) {
              availableQuestions.push(element)
            }
          })

          let randomItem = availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
          setChat(id, currentQuestion, questions[randomItem])
          pushItem(id, answeredQuestions, randomItem)
        }

        let options = {}
        switch (getAttr(id, currentQuestion).answer_type) {
          case 'qcm':
            options = {
              'reply_markup': {
                'keyboard': getAttr(id, currentQuestion).choices.map(x => [x])
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

        bot.sendMessage(id, getAttr(id, currentQuestion).question, options)
        setCurrentState(id, state[stateSuffix].ask_question)
      } else {
        bot.sendMessage(id, "Dites moi 'oui' quand vous serez prêt !", {
          'reply_markup': {
            'keyboard': [['oui']]
          }
        })
      }
      break
    case getCurrentState(id) === state[stateSuffix].ask_question:
      setCurrentState(id, state[stateSuffix].got_answer)
      answer = msg.text

      let correctAnswer = false
      switch (getAttr(id, currentQuestion).answer_type) {
        case 'boolean':
          let questionAnswer = getAttr(id, currentQuestion).answer
          correctAnswer = ((answer === 'vrai' && questionAnswer === true) ||
                        (answer === 'faux' && questionAnswer === false))
          break
        case 'eval':
          let functionToTest = getAttr(id, currentQuestion).test.function
          functionToTest = functionToTest.replace('REPLACE_ME', answer)
          let expected = getAttr(id, currentQuestion).test.expected

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
          correctAnswer = (answer === getAttr(id, currentQuestion).answer)
          break
      }

      incr(id, score, (correctAnswer ? getAttr(id, currentQuestion).score : 0))
      bot.sendMessage(id, (correctAnswer ? 'Très bien !' : 'Vous avez mal répondu.'))
      setChat(id, currentQuestion, undefined)

      if (getAttr(id, count) >= (isDevQuestion ? config.askNbDevQuestions : config.askNbNetworkQuestions)) {
        let message = isDevQuestion ? 'Les questions de développement sont maintenant terminées.' : 'Les questions de réseau sont maintenant terminées.'
        bot.sendMessage(id, message)

        if (isDevQuestion) {
          setCurrentState(id, state.networkQuestions.begin)
          replay.push(require('../partials/network_question'))
        } else {
          setCurrentState(id, state.postQuestions.begin)
          replay.push(require('../partials/post_questions'))
        }
      } else {
        bot.sendMessage(id, 'Prêt pour la question suivante ? (oui/non)', {
          'reply_markup': {
            'keyboard': [['oui'], ['non']]
          }
        })
        setCurrentState(id, state[stateSuffix].are_you_ready)
      }

      break
    default:
      trigger = false
      break
  }
  return [trigger, replay]
}
