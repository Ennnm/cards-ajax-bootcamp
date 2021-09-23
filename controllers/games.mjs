import pkg from 'sequelize';

const { Op } = pkg;
/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Card Deck Functions
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

// get a random index from an array given it's size
const getRandomIndex = function (size) {
  return Math.floor(Math.random() * size);
};

// cards is an array of card objects
const shuffleCards = function (cards) {
  let currentIndex = 0;

  // loop over the entire cards array
  while (currentIndex < cards.length) {
    // select a random position from the deck
    const randomIndex = getRandomIndex(cards.length);

    // get the current card in the loop
    const currentItem = cards[currentIndex];

    // get the random card
    const randomItem = cards[randomIndex];

    // swap the current card and the random card
    cards[currentIndex] = randomItem;
    cards[randomIndex] = currentItem;

    currentIndex += 1;
  }

  // give back the shuffled deck
  return cards;
};

const makeDeck = function () {
  // create the empty deck at the beginning
  const deck = [];

  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

  let suitIndex = 0;
  while (suitIndex < suits.length) {
    // make a variable of the current suit
    const currentSuit = suits[suitIndex];

    // loop to create all cards in this suit
    // rank 1-13
    let rankCounter = 1;
    while (rankCounter <= 13) {
      let cardName = rankCounter;

      // 1, 11, 12 ,13
      if (cardName === 1) {
        cardName = 'ace';
      } else if (cardName === 11) {
        cardName = 'jack';
      } else if (cardName === 12) {
        cardName = 'queen';
      } else if (cardName === 13) {
        cardName = 'king';
      }

      // make a single card object variable
      const card = {
        name: cardName,
        suit: currentSuit,
        rank: rankCounter,
      };

      // add the card to the deck
      deck.push(card);

      rankCounter += 1;
    }
    suitIndex += 1;
  }

  return deck;
};
const playerGameOutcome = (playerHand, opponentHand) => {
  const currPlayerRank = playerHand[0].rank;
  const oppPlayerRank = opponentHand[0].rank;
  if (currPlayerRank === oppPlayerRank)
  {
    return 'tie';
  }
  if (currPlayerRank > oppPlayerRank)
  {
    return 'win';
  }
  return 'lose';
};
/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Controller Functions
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

export default function initGamesController(db) {
  // render the main page
  const index = (request, response) => {
    response.render('games/index');
  };
  // create a new game. Insert a new row in the DB.
  const create = async (request, response) => {
    const { userId } = request.cookies;
    const { opponent } = request.body;
    // deal out a new shuffled deck for this game.
    const cardDeck = shuffleCards(makeDeck());
    const playerHand = [cardDeck.pop()];
    const opponentHand = [cardDeck.pop()];
    const playerOutcome = playerGameOutcome(playerHand, opponentHand);
    console.log('playerOutcome :>> ', playerOutcome);
    console.log('in create game');
    const newGame = {
      gameState: {
        cardDeck,
        opponent,
        playerHand,
        opponentHand,
        gameOutcomes: [playerOutcome],
      },
    };
    try {
      // run the DB INSERT query
      console.log('userId :>> ', userId);
      const game = await db.Game.create(newGame);
      game.addUser(userId);
      game.addUser(opponent.id);

      // send the new game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        playerHand: game.gameState.playerHand,
        opponentHand: game.gameState.opponentHand,
        gameOutcomes: game.gameState.gameOutcomes,
      });
    } catch (error) {
      console.log('error in creating game :>> ', error);
      response.status(500).send(error);
    }
  };

  // deal two new cards from the deck.
  const deal = async (request, response) => {
    const { userId } = request.cookies;
    try {
      // get the game by the ID passed in the request
      const game = await db.Game.findByPk(request.params.id);

      // make changes to the object
      const playerHand = [game.gameState.cardDeck.pop(), game.gameState.cardDeck.pop()];
      const opponentHand = [game.gameState.cardDeck.pop(), game.gameState.cardDeck.pop()];
      const playerOutcome = playerGameOutcome(playerHand, opponentHand);
      console.log('game.gameState.gameOutcomes :>> ', game.gameState.gameOutcomes);
      // cannot push itmes directly into game.gameState. this is not rewritable without update
      const gameRecord = [...game.gameState.gameOutcomes, playerOutcome];
      // update the game with the new info
      await game.update({
        gameState: {
          cardDeck: game.gameState.cardDeck,
          userId,
          playerHand,
          opponentHand,
          gameOutcomes: gameRecord,
        },

      });

      // send the updated game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        userId,
        playerHand: game.gameState.playerHand,
        opponentHand: game.gameState.opponentHand,
        gameOutcomes: game.gameState.gameOutcomes,
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };
  const show = async (req, res) => {
    const gameId = req.params.id;
    try {
      const game = await db.Game.findByPk(gameId);
      // send back game status in response
      res.send({
        id: game.id,
        playerHand: game.gameState.playerHand,
        opponentHand: game.gameState.opponentHand,
        gameOutcomes: game.gameState.gameOutcomes,
      });
    } catch (error) {
      console.log('error in showing current game status :>> ', error);
    }
  };

  const setWinner = async (req, res) => {
    const gameId = req.params.id;
    const { playerId, isWin } = req.body;

    const game = await db.Game.findByPk(gameId);
    let winner;
    if (isWin) {
      winner = await db.User.findByPk(playerId);
    }
    else {
      const gameUsers = await game.getUsers();
      // eslint-disable-next-line prefer-destructuring
      winner = gameUsers.filter((user) => user.id !== playerId)[0];
    }
    // game.addWinner(winner);
    console.log('winner :>> ', winner);

    game.setWinner(winner);
  };
  // return all functions we define in an object
  // refer to the routes file above to see this used
  return {
    deal,
    create,
    index,
    show,
    setWinner,
  };
}
