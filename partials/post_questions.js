let { getChat } = require("../helper/chatsHandler");

let { getCurrentState, setCurrentState } = require("../helper/chatsHandler");

const { devQuestions, networkQuestions, regex, state } = require("../helper/variables")

let bot = undefined;

module.exports.init = (_bot) => {
    bot = _bot;
};

module.exports.getName = () => {
    return __filename;
}

module.exports.run = function (msg) {
    var id = msg.from.id;
    var trigger = true;
    let replay = [];

    switch (true) {
        case regex.post_question.test(msg.text) && getCurrentState(id) == state.none:
        case getCurrentState(id) == state.postQuestions.begin:
            // Let's compute results

            console.log("Here I am !");

            //console.log(getChat(id))

            bot.sendMessage(id, "Je vais désormais calculer vos résultats..")

            let userScoreDev = getChat(id).scoreDev;
            let userScoreNetwork = getChat(id).scoreNetwork;

            let scoreMaxDev = Object.keys(devQuestions).map(x => {
                return devQuestions[x].score;
            }).reduce((accumulator, currentValue) => accumulator+= currentValue);

            let scoreMaxNetwork = Object.keys(networkQuestions).map(x => {
                return networkQuestions[x].score;
            }).reduce((accumulator, currentValue) => accumulator+= currentValue);

            console.log(userScoreDev);
            console.log(userScoreNetwork);
            console.log(scoreMaxDev);
            console.log(scoreMaxNetwork);
            
            


            //setCurrentState(id, state.onBoarding.asked);
            break;
        default:
            trigger = false;
            break;
    }
    return [trigger, replay];
}