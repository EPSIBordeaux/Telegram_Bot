let { getChat } = require("../helper/chatsHandler");

let { getCurrentState, setCurrentState } = require("../helper/chatsHandler");

const { devQuestions, networkQuestions, regex, state, jobs } = require("../helper/variables")

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
            bot.sendMessage(id, "Je vais désormais calculer vos résultats..")

            let userScoreDev = getChat(id).scoreDev;
            let userScoreNetwork = getChat(id).scoreNetwork;

            let devJobs = jobs.filter((element) => {
                return userScoreDev >= element.scoreMin && element.type == "dev";
            }).sort((a, b) => {
                return b.scoreMin - a.scoreMin;
            });

            let networkJobs = jobs.filter((element) => {
                return userScoreNetwork >= element.scoreMin && element.type == "network";
            }).sort((a, b) => {
                return b.scoreMin - a.scoreMin;
            });

            // TODO, ici eventuellement, on peut limiter à un ou deux jobs par catégorie, en filtrant les 2 premiers éléments
            // qui nécessite d'avoir le score le plus haut (et donc le plus proche du niveau du candidat)

            let availablesJobs = devJobs.concat(networkJobs);

            let message = "";
            let options = {}
            if (availablesJobs.length > 0) {
                message = `Suite à vos tests, voici les offres que nous pouvons vous proposer.\n`
                availablesJobs.forEach((element) => {
                    let jobType = element.type == "dev" ? "Développement" : "Réseau";
                    message += `${element.id} - ${element.name} (${element.salary}) - ${element.location}`;
                    message += `:\n\t- Specialité : ${jobType}\n\t- Description : ${element.comment}\n\t- Type de contrat : ${element.contract}\n`
                })

                let choices = [["Aucun"]].concat(availablesJobs.sort((a, b) => a.id - b.id).map(x => [x.id]));
                message += "Veuillez choisir le poste qui vous intéresse en cliquant sur sa référence, ou sur aucun si aucun poste ne vous intéresse."
                setCurrentState(id, state.postQuestions.propose_jobs);
                options = {
                    "reply_markup": {
                        "keyboard": choices
                    }
                }
            } else {
                message = "Malheureusement, aucun poste n'est actuellement disponible pour votre profil.\nVoulez-vous nous laisser vos coordonnées afin que nous puissions vous recontacter lorsque nous aurons des offres correspondant à votre profil ?"
                setCurrentState(id, state.postQuestions.no_jobs);
                options = {
                    "reply_markup": {
                        "keyboard": [["oui"], ["non"]]
                    }
                }
            }

            console.log(message);
            bot.sendMessage(id, message, options);
            break;
        case state.postQuestions.propose_jobs:
            // TODO
            break;
        case state.postQuestions.no_jobs:
            // TODO
            break;
        default:
            trigger = false;
            break;
    }
    return [trigger, replay];
}