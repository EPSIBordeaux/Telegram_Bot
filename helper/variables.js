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
    askNbDevQuestions: 2
};

module.exports.devQuestions = {
    1: {
        question: "Le C est un language compilé. (vrai/faux)",
        answer_type: "boolean",
        answer: true, 
        score: 1
    }
};