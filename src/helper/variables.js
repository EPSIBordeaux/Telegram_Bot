module.exports.state = {
  none: 0,
  identity: {
    begin: 20,
    firstname_asked: 1,
    firstname_received: 2,
    name_asked: 4,
    name_received: 5,
    email_asked: 21,
    email_received: 22
  },
  devQuestions: {
    are_you_ready: 6,
    ask_question: 7,
    got_answer: 8,
    begin: 14
  },
  onBoarding: {
    asked: 9
  },
  networkQuestions: {
    are_you_ready: 10,
    ask_question: 11,
    got_answer: 12,
    begin: 15
  },
  end: 13,
  postQuestions: {
    begin: 16,
    propose_jobs: 17,
    no_jobs: 18,
    ask_identity: 19
  }
}

module.exports.regex = {
  start: /^\/?start$/i,
  parrot: new RegExp(`${process.env.TOKEN}say (.*)`),
  hello: new RegExp(`${process.env.TOKEN}hello`),
  identity: new RegExp(`${process.env.TOKEN}identity`),
  dev_question: new RegExp(`${process.env.TOKEN}devQuestion`),
  network_question: new RegExp(`${process.env.TOKEN}networkQuestion`),
  post_question: new RegExp(`${process.env.TOKEN}postQuestion`),
  reset: /^(?:recommencer)|(?:Je veux recommencer)|(?:Je souhaite recommencer)$/i,
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
}

module.exports.config = {
  askNbDevQuestions: 3,
  askNbNetworkQuestions: 2
}

/**
 * The score are relative to others questions. They are not score, or percentage. Like planning poker ;)
 */
module.exports.devQuestions = {
  1: {
    question: 'Le C est un language compilé. (vrai/faux)',
    answer_type: 'boolean',
    answer: true,
    score: 1
  },
  2: {
    question: 'Ecrivez une fonction qui inverse une chaine de charactère.\nLa valeur sera retournée à la fin de la fonction',
    answer_type: 'eval',
    test: {
      expected: 'nruter',
      function: "(REPLACE_ME)('return')"
    },
    score: 3
  },
  3: {
    question: "Lequel de ces framework n'est pas un framework PHP ?",
    answer_type: 'qcm',
    choices: ['Symfony', 'CakePHP', 'Meteor', 'Laravel'],
    answer: 'Meteor',
    score: 2
  }
}

/**
 * The score are relative to others questions. They are not score, or percentage. Like planning poker ;)
 */
module.exports.networkQuestions = {
  1: {
    question: 'Une question à laquelle il faut répondre faux',
    answer_type: 'boolean',
    answer: false,
    score: 1
  },
  2: {
    question: 'Prenez le choix 3',
    answer_type: 'qcm',
    choices: ['Choix 1', 'Choix 2', 'Choix 3', 'Choix 4'],
    answer: 'Choix 3',
    score: 2
  }
}

/**
 * scoreMinDev and scoreMinNetwork are percentage. Undefined if not related to the job ( = not a requirement)
 */
module.exports.jobs = [
  {
    id: 1,
    name: 'Développeur Web Junior',
    percentageDev: 70,
    percentageNetwork: undefined,
    type: 'dev',
    contract: 'CDI',
    comment: 'Une super offre! ',
    url: 'https://goo.gl/Y77Yrp'
  },
  {
    id: 2,
    name: 'Admin Système Junior',
    percentageDev: undefined,
    percentageNetwork: 2,
    type: 'network',
    contract: 'CDI',
    comment: 'Une super offre! ',
    url: 'https://goo.gl/wYAeZm'
  },
  {
    id: 3,
    name: 'Admin Système Junior',
    percentageDev: 1,
    percentageNetwork: 3,
    type: 'network',
    contract: 'CDI',
    comment: 'Une super offre !',
    url: 'https://goo.gl/Y77Yrp'
  },
  {
    id: 4,
    name: 'Développeur Web',
    percentageDev: 1,
    percentageNetwork: 1,
    type: 'dev',
    contract: 'stage',
    comment: 'Une super offre de stage! ',
    url: 'https://goo.gl/wYAeZm'
  }
]
