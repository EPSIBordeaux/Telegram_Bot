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
    },
    onBoarding: {
        asked: 9
    }
};

module.exports.regex = {
    start: /^\/start$/,
    parrot: /^say (.*)$/,
    hello: /^hell.?o$/i,
    firstname: /^firstname$/,
    dev_question: /^devQuestion$/,
};

module.exports.config = {
    askNbDevQuestions: 3
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