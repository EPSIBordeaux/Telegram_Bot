require("dotenv").config();
const expect = require('chai').expect;

const TelegramServer = require('telegram-test-api');
const TelegramBot = require('node-telegram-bot-api');
const Bot = require("./bot");
const messageHelper = require("./helper/test_message_helper");

describe("My Chat Bot Tests", function () {

  let client, server, token, telegramBot, testBot;

  before(function (done) {
    token = process.env.TOKEN;
    let serverConfig = {
      "port": 9000,
      "host": "localhost",
      "storage": "RAM",
      "storeTimeout": 60
    };
    server = new TelegramServer(serverConfig);

    // Ugly hack to remove middleware that log every request. 
    // MUST be called before server is started
    server.webServer._router.stack.pop();

    server.start().then(() => {
      client = server.getClient(token);
      let botOptions = { polling: true, baseApiUrl: server.ApiURL };
      testBot = new Bot(token, botOptions);

      messageHelper.init(client);
      done();
    });
  });

  beforeEach((done) => {
    messageHelper.newClient();
    done();
  });

  after(function (done) {
    testBot.stop();
    server.stop().then(() => done());
  })

  describe("Onboarding", function () {
    it("Should make an onboarding question to the user", function () {
      this.slow(1000);
      this.timeout(3000);

      return messageHelper.assert("/start", "Bonjour !\nJe me présente, je suis un petit bot de recrutement.\nSi vous le souhaitez, je vais vous poser quelques questions afin de voir quel poste pourrait vous convenir. Êtes-vous prêt ?")
        .then(() => messageHelper.assert("oui", ["Parfait, commençons !", "Voici une question de développement, êtes-vous prêt ? (oui/non)"]));
    });

    it("Should make an onboarding question to the user but the user doesn't want to start", function () {
      this.slow(1000);
      this.timeout(3000);

      return messageHelper.assert("/start", "Bonjour !\nJe me présente, je suis un petit bot de recrutement.\nSi vous le souhaitez, je vais vous poser quelques questions afin de voir quel poste pourrait vous convenir. Êtes-vous prêt ?")
        .then(() => messageHelper.assert("non", "Très bien, dites moi 'oui' quand vous serez prêt !"))
        .then(() => expect(messageHelper.getClientChatData(testBot).current_state).equal(messageHelper.getStates().onBoarding.asked));
    });
  });

  describe("Simple tests with keyword", function () {
    it('should do the parrot', function () {
      this.slow(1000);
      this.timeout(3000);

      return messageHelper.assert(`${process.env.TOKEN}say hello`, "hello");
    });

    it('should ask firstname and name', function () {
      this.slow(2000);
      this.timeout(3000);

      return messageHelper.assert(`${process.env.TOKEN}identity`, "Quel est votre nom ?")
        .then(() => messageHelper.assert("Dupont", "Votre nom est 'Dupont'. Est-ce correct ? (oui/non)"))
        .then(() => messageHelper.assert("oui", "Très bien, quel est votre prénom ?"))
        .then(() => messageHelper.assert("Jean", "Votre prénom est 'Jean'. Est-ce correct ? (oui/non)"))
        .then(() => messageHelper.assert("oui", "Parfait !"));
    });
  });

  describe("Development Questions with keyword", function () {
    it("Should answer right to a boolean dev question so its score is equal to 1", function () {
      this.slow(1000);
      this.timeout(3000);

      return messageHelper.assert(`${process.env.TOKEN}devQuestion`, "Voici une question de développement, êtes-vous prêt ? (oui/non)")
        .then(() => {
          messageHelper.setCustomDevQuestion(testBot, 1);
          return messageHelper.assert("oui", "Le C est un language compilé. (vrai/faux)")
        })
        .then(() => messageHelper.assert("vrai", ["Très bien !", "Prêt pour la question suivante ? (oui/non)"]))
        .then(() => expect(messageHelper.getClientChatData(testBot).scoreDev).equal(1));
    });

    it("Should answer right to a eval dev question so its score is equal to 3", function () {
      this.slow(1000);
      this.timeout(3000);

      return messageHelper.assert(`${process.env.TOKEN}devQuestion`, "Voici une question de développement, êtes-vous prêt ? (oui/non)")
        .then(() => {
          messageHelper.setCustomDevQuestion(testBot, 2)
          return messageHelper.assert("oui", "Ecrivez une fonction qui inverse une chaine de charactère.\nLa valeur sera retournée à la fin de la fonction")
        })
        .then(() => messageHelper.assert("function a(my_string) {return my_string.split('').reverse().join('');}", ["Très bien !", "Prêt pour la question suivante ? (oui/non)"]))
        .then(() => expect(messageHelper.getClientChatData(testBot).scoreDev).equal(3));
    });

    it("Should answer wrong to 2 dev questions so its score is equal to 0", function () {
      this.slow(1000);
      this.timeout(3000);

      // We won't check the output because they are randomly asked. So we'll answer a dummy response.
      return messageHelper.assert(`${process.env.TOKEN}devQuestion`, "Voici une question de développement, êtes-vous prêt ? (oui/non)")
        .then(() => messageHelper.assert("oui", "", { no_check: true }))
        .then(() => messageHelper.assert("Je ne répondrais pas !", ["Vous avez mal répondu.", "Prêt pour la question suivante ? (oui/non)"]))
        .then(() => messageHelper.assert("oui", "", { no_check: true }))
        .then(() => messageHelper.assert("Je ne répondrais pas !", ["Vous avez mal répondu.", "Prêt pour la question suivante ? (oui/non)"]))
        .then(() => expect(messageHelper.getClientChatData(testBot).scoreDev).equal(0));
    });

    it("Should answer right to a QCM dev question so its score is equal to 2", function () {
      this.slow(1000);
      this.timeout(3000);

      return messageHelper.assert(`${process.env.TOKEN}devQuestion`, "Voici une question de développement, êtes-vous prêt ? (oui/non)")
        .then(() => {
          messageHelper.setCustomDevQuestion(testBot, 3)
          return messageHelper.assert("oui", "Lequel de ces framework n'est pas un framework PHP ?")
        })
        .then(() => messageHelper.assert("Meteor", ["Très bien !", "Prêt pour la question suivante ? (oui/non)"]))
        .then(() => expect(messageHelper.getClientChatData(testBot).scoreDev).equal(2));
    });
  });

  describe("Network Questions with keyword", function () {
    it("Should answer wrong to all network questions so its score is equal to 0", function () {
      this.slow(1000);
      this.timeout(3000);

      return messageHelper.assert(`${process.env.TOKEN}networkQuestion`, "Voici une question de réseau, êtes-vous prêt ? (oui/non)")
        .then(() => messageHelper.assert("oui", "", { no_check: true }))
        .then(() => messageHelper.assert("Je ne répondrais pas !", ["Vous avez mal répondu.", "Prêt pour la question suivante ? (oui/non)"]))
        .then(() => messageHelper.assert("oui", "", { no_check: true }))
        .then(() => messageHelper.assert("Je ne répondrais pas !", ["Vous avez mal répondu.", "Les questions de réseau sont maintenant terminées.", "Je vais désormais calculer vos résultats..", "Malheureusement, aucun poste n'est actuellement disponible pour votre profil.\nVoulez-vous nous laisser vos coordonnées afin que nous puissions vous recontacter lorsque nous aurons des offres correspondant à votre profil ?"]))
        .then(() => expect(messageHelper.getClientChatData(testBot).scoreNetwork).equal(0));
    });

    it("Should answer right to all network questions so its score is equal to 3", function () {
      this.slow(1000);
      this.timeout(3000);

      return messageHelper.assert(`${process.env.TOKEN}networkQuestion`, "Voici une question de réseau, êtes-vous prêt ? (oui/non)")
        .then(() => {
          messageHelper.setCustomNetworkQuestion(testBot, 1);
          return messageHelper.assert("oui", "Une question à laquelle il faut répondre faux")
        })
        .then(() => messageHelper.assert("faux", ["Très bien !", "Prêt pour la question suivante ? (oui/non)"]))
        .then(() => {
          messageHelper.setCustomNetworkQuestion(testBot, 2)
          return messageHelper.assert("oui", "Prenez le choix 3")
        })
        .then(() => messageHelper.assert("Choix 3", ["Très bien !", "Les questions de réseau sont maintenant terminées.", "Je vais désormais calculer vos résultats..", undefined]))
        .then(() => expect(messageHelper.getClientChatData(testBot).scoreNetwork).equal(3));
    });
  });

  describe("Workflow tests", function () {
    it("Should be a conversation workflow", function () {
      this.slow(3000);
      this.timeout(6000);

      return messageHelper.assert("/start", "Bonjour !\nJe me présente, je suis un petit bot de recrutement.\nSi vous le souhaitez, je vais vous poser quelques questions afin de voir quel poste pourrait vous convenir. Êtes-vous prêt ?")
        .then(() => messageHelper.assert("oui", ["Parfait, commençons !", "Voici une question de développement, êtes-vous prêt ? (oui/non)"]))
        .then(() => messageHelper.assert("oui", "", { no_check: true }))
        .then(() => messageHelper.assert("Je ne répondrais pas !", ["Vous avez mal répondu.", "Prêt pour la question suivante ? (oui/non)"], { debug_message: "AZE" }))
        .then(() => messageHelper.assert("oui", "", { no_check: true }))
        .then(() => messageHelper.assert("Je ne répondrais pas !", ["Vous avez mal répondu.", "Prêt pour la question suivante ? (oui/non)"], { debug_message: "POI" }))
        .then(() => messageHelper.assert("oui", "", { no_check: true }))
        .then(() => messageHelper.assert("Je ne répondrais pas !", ["Vous avez mal répondu.", "Les questions de développement sont maintenant terminées.", "Voici une question de réseau, êtes-vous prêt ? (oui/non)"]))
    });

    it("Should answer right to all questions but don't want a job", function () {
      this.slow(5000);
      this.timeout(7000);

      return messageHelper.assert("/start", "Bonjour !\nJe me présente, je suis un petit bot de recrutement.\nSi vous le souhaitez, je vais vous poser quelques questions afin de voir quel poste pourrait vous convenir. Êtes-vous prêt ?")
        .then(() => messageHelper.assert("oui", ["Parfait, commençons !", "Voici une question de développement, êtes-vous prêt ? (oui/non)"]))
        .then(() => {
          messageHelper.setCustomDevQuestion(testBot, 1);
          return messageHelper.assert("oui", "Le C est un language compilé. (vrai/faux)")
        })
        .then(() => messageHelper.assert("vrai", ["Très bien !", "Prêt pour la question suivante ? (oui/non)"]))
        .then(() => {
          messageHelper.setCustomDevQuestion(testBot, 2)
          return messageHelper.assert("oui", "Ecrivez une fonction qui inverse une chaine de charactère.\nLa valeur sera retournée à la fin de la fonction")
        })
        .then(() => messageHelper.assert("function a(my_string) {return my_string.split('').reverse().join('');}", ["Très bien !", "Prêt pour la question suivante ? (oui/non)"]))
        .then(() => {
          messageHelper.setCustomDevQuestion(testBot, 3)
          return messageHelper.assert("oui", "Lequel de ces framework n'est pas un framework PHP ?")
        })
        .then(() => messageHelper.assert("Meteor", ["Très bien !", "Les questions de développement sont maintenant terminées.", "Voici une question de réseau, êtes-vous prêt ? (oui/non)"]))
        .then(() => {
          messageHelper.setCustomNetworkQuestion(testBot, 1);
          return messageHelper.assert("oui", "Une question à laquelle il faut répondre faux")
        })
        .then(() => messageHelper.assert("faux", ["Très bien !", "Prêt pour la question suivante ? (oui/non)"]))
        .then(() => {
          messageHelper.setCustomNetworkQuestion(testBot, 2)
          return messageHelper.assert("oui", "Prenez le choix 3")
        })
        .then(() => {
          let expect = "Suite à vos tests, voici les offres que nous pouvons vous proposer.\n1 - Développeur Web Junior - https://goo.gl/Y77Yrp :\n\t- Specialité : Développement\n\t- Description : Une super offre! \n\t- Type de contrat : CDI\n4 - Développeur Web - https://goo.gl/wYAeZm :\n\t- Specialité : Développement\n\t- Description : Une super offre de stage! \n\t- Type de contrat : stage\n3 - Admin Système Junior - https://goo.gl/Y77Yrp :\n\t- Specialité : Réseau\n\t- Description : Une super offre !\n\t- Type de contrat : CDI\n2 - Admin Système Junior - https://goo.gl/wYAeZm :\n\t- Specialité : Réseau\n\t- Description : Une super offre! \n\t- Type de contrat : CDI\nVeuillez choisir le poste qui vous intéresse en cliquant sur sa référence, ou sur aucun si aucun poste ne vous intéresse.";
          return messageHelper.assert("Choix 3", ["Très bien !", "Les questions de réseau sont maintenant terminées.", "Je vais désormais calculer vos résultats..", expect])
        })
        .then(() => messageHelper.assert("Aucun", "Nous sommes désolé de ne pas avoir d'offres qui vous conviennent.\nVoulez-vous nous laisser vos coordonnées afin que nous puissions vous recontacter lorsque nous aurons de nouvelles offres ?"))
        .then(() => messageHelper.assert("non", ["Je ne peux rien faire sans votre accord. Je suis donc dans l'obligation de mettre fin à cette conversation.", "Je vous remercie d'avoir utilisé notre plateforme de recrutement et vous souhaite une agréable journée"]))
    })
  });

  describe("Misc tests", function () {

    it.skip("Should have a reply_markup keyboard hidden by default.", function () {
      this.slow(1000);
      this.timeout(2000);
      // TODO Write test
      this.skip();
    });

    it("Should reset the conversation", function () {
      this.slow(1000);
      this.timeout(3000);

      let expected = {
        current_state: messageHelper.getStates().none
      }

      return messageHelper.assert("recommencer", "Recommençons ! Tapez 'start' pour commencer")
        .then(() => expect(messageHelper.getClientChatData(testBot)).deep.equal(expected))
    });

    it("Should reset the conversation at any time.", function () {
      this.slow(2000);
      this.timeout(3000);

      let expected = {
        current_state: messageHelper.getStates().none
      }

      return messageHelper.assert("/start", "Bonjour !\nJe me présente, je suis un petit bot de recrutement.\nSi vous le souhaitez, je vais vous poser quelques questions afin de voir quel poste pourrait vous convenir. Êtes-vous prêt ?")
        .then(() => messageHelper.assert("oui", ["Parfait, commençons !", "Voici une question de développement, êtes-vous prêt ? (oui/non)"]))
        .then(() => messageHelper.assert("Je veux recommencer", "Recommençons ! Tapez 'start' pour commencer"))
        .then(() => expect(messageHelper.getClientChatData(testBot)).deep.equal(expected))
    });
  })


});