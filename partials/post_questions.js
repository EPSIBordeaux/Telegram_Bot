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
    let message, options, answer;

    switch (true) {
        case regex.post_question.test(msg.text) && getCurrentState(id) == state.none:
        case getCurrentState(id) == state.postQuestions.begin:
            // Let's compute results
            bot.sendMessage(id, "Je vais désormais calculer vos résultats..")

            let userScoreDev = getChat(id).scoreDev;
            let userScoreNetwork = getChat(id).scoreNetwork;

            let maxScoreDev = 0;
            if (getChat(id).answeredQuestions.length > 0) {
                maxScoreDev = getChat(id).answeredQuestions.reduce((total, element) => total += element);
            }

            let maxScoreNetwork = 0;
            if (getChat(id).answeredNetworkQuestions.length > 0) {
                getChat(id).answeredNetworkQuestions.reduce((total, element) => total += element);
            }

            let userDevPercentage = (userScoreDev / maxScoreDev) * 100;
            let userNetworkPercentage = (userScoreNetwork / maxScoreNetwork) * 100;

            let devJobs = jobs.filter((element) => {
                let devPart = userDevPercentage >= element.percentageDev && element.type == "dev";

                let networkPart = true;
                if (element.percentageNetwork != undefined) {
                    networkPart = userNetworkPercentage >= element.percentageNetwork && element.type == "dev";
                }

                return devPart && networkPart;
            }).sort((a, b) => {
                return b.percentageDev - a.percentageDev;
            });

            let networkJobs = jobs.filter((element) => {
                let networkPart = userNetworkPercentage >= element.percentageNetwork && element.type == "network";

                let devPart = true;
                if (element.percentageDev != undefined) {
                    devPart = userDevPercentage >= element.percentageDev && element.type == "network";
                }

                return networkPart && devPart;
            }).sort((a, b) => {
                return b.percentageNetwork - a.percentageNetwork;
            });

            // TODO, ici eventuellement, on peut limiter à un ou deux jobs par catégorie, en filtrant les 2 premiers éléments
            // qui nécessite d'avoir le score le plus haut (et donc le plus proche du niveau du candidat)

            let availablesJobs = devJobs.concat(networkJobs);

            message = "";
            options = {}
            if (availablesJobs.length > 0) {
                message = `Suite à vos tests, voici les offres que nous pouvons vous proposer.\n`
                availablesJobs.forEach((element) => {
                    let jobType = element.type == "dev" ? "Développement" : "Réseau";
                    message += `${element.id} - ${element.name} - ${element.url}`;
                    message += ` :\n\t- Specialité : ${jobType}\n\t- Description : ${element.comment}\n\t- Type de contrat : ${element.contract}\n`
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

            bot.sendMessage(id, message, options);
            break;
        case getCurrentState(id) == state.postQuestions.propose_jobs:
            answer = msg.text;
            message = "";
            options = {
                "reply_markup": {
                    "keyboard": [["oui"], ["non"]]
                }
            }

            if (answer == "Aucun") {
                message = "Nous sommes désolé de ne pas avoir d'offres qui vous conviennent.\nVoulez-vous nous laisser vos coordonnées afin que nous puissions vous recontacter lorsque nous aurons de nouvelles offres ?";
            } else {
                let jobSelected = job.filter((element) => answer == element.id);
                console.log(jobSelected);
                message = "Ravi de voir que nous pourrions collaborer ensemble !\nNous avons maintenant besoin de vos informations pour vous recontacter en vue d'un entretien, êtes vous d'accord ?";
            }

            bot.sendMessage(id, message, options);
            setCurrentState(id, state.postQuestions.ask_identity);
            break;
        case getCurrentState(id) == state.postQuestions.no_jobs:
        case getCurrentState(id) == state.postQuestions.ask_identity:
            answer = msg.text;
            message = "";

            if (answer == "oui") {
                message = "Parfait ! Je vais donc vous demander votre nom, prénom et email.";
                setCurrentState(id, state.identity.begin);
                replay.push(require('./identity'));
            } else {
                message = "Je ne peux rien faire sans votre accord. Je suis donc dans l'obligation de mettre fin à cette conversation.";
                setCurrentState(id, state.end);
                replay.push(require('./common'));
            }

            bot.sendMessage(id, message);
            break;
        default:
            trigger = false;
            break;
    }

    return [trigger, replay];
}