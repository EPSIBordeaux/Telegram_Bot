module.exports.state = {
    none: 0,
    identity: {
        firstname_asked: 1,
        firstname_received: 2,
        name_asked: 4,
        name_received: 5,
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

    }
};

module.exports.regex = {
    start: /^\/start$/i,
    parrot: new RegExp(`${process.env.TOKEN}say (.*)`),
    hello: new RegExp(`${process.env.TOKEN}hello`),
    firstname: new RegExp(`${process.env.TOKEN}firstname`),
    dev_question: new RegExp(`${process.env.TOKEN}devQuestion`),
    network_question: new RegExp(`${process.env.TOKEN}networkQuestion`),
    post_question: new RegExp(`${process.env.TOKEN}postQuestion`)
};

module.exports.config = {
    askNbDevQuestions: 3,
    askNbNetworkQuestions: 2
};

module.exports.devQuestions = {
    1: {
        question: "Le C est un language compilé. (vrai/faux)",
        answer_type: "boolean",
        answer: true,
        score: 1
    },
    2: {
        question: "Ecrivez une fonction qui inverse une chaine de charactère.\nLa valeur sera retournée à la fin de la fonction",
        answer_type: "eval",
        test: {
            expected: "nruter",
            function: "(REPLACE_ME)('return')"
        },
        score: 3
    },
    3: {
        question: "Lequel de ces framework n'est pas un framework PHP ?",
        answer_type: "qcm",
        choices: ["Symfony", "CakePHP", "Meteor", "Laravel"],
        answer: "Meteor",
        score: 2
    }
};

module.exports.networkQuestions = {
    1: {
        question: "Une question à laquelle il faut répondre faux",
        answer_type: "boolean",
        answer: false,
        score: 1
    },
    2: {
        question: "Prenez le choix 3",
        answer_type: "qcm",
        choices: ["Choix 1", "Choix 2", "Choix 3", "Choix 4"],
        answer: "Choix 3",
        score: 2
    }
}