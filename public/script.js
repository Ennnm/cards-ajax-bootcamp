// global value that holds info about the current hand.
let currentGame = null;

document.body.classList.add('container');
// create game btn
const createGameBtn = document.createElement('button');
const loginBtn = document.createElement('button');
const registrationBtn = document.createElement('button');
const dealBtn = document.createElement('button');
const refreshBtn = document.createElement('button');

const findMatch = async () => {
  const res = await axios.get('/findmatch').catch((e) => console.log('error in finding match', e));
  return res.data;
};

// loggedin status in user table?
// need to auto log out after 30mins of inactivity

const currPlayerGameStatus = (playerHand, opponentHand) => {
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

// DOM manipulation function that displays the player's current hand.

const runGame = function ({ playerHand, opponentHand }) {
  // manipulate DOM
  const gameContainer = document.querySelector('#game-container');
  gameContainer.innerHTML = '';
  const currPlayerContainer = document.createElement('div');
  const oppPlayerContainer = document.createElement('div');

  gameContainer.classList.add('d-flex', 'justify-content-around');
  currPlayerContainer.classList.add('d-inline');
  oppPlayerContainer.classList.add('d-inline');

  currPlayerContainer.innerText = `
    Your Hand:
    ====
    ${playerHand[0].name}
    of
    ${playerHand[0].suit}
  `;

  oppPlayerContainer.innerText = `
    Opponent's Hand:
    ====
    ${opponentHand[0].name}
    of
    ${opponentHand[0].suit}
  `;

  const gameStatus = document.createElement('div');
  gameStatus.innerText = `You ${currPlayerGameStatus(playerHand, opponentHand)}`;
  // gameStatus.classList.add('d-inline');

  gameContainer.appendChild(currPlayerContainer);
  gameContainer.appendChild(oppPlayerContainer);
  gameContainer.appendChild(gameStatus);
};

// make a request to the server
// to change the deck. set 2 new cards into the player hand.
const countWinsTiesLosses = ({ gameOutcomes }) => {
  let winCount = 0;
  let tieCount = 0;
  let lossCount = 0;

  for (let i = 0; i < gameOutcomes.length; i++) {
    const outcome = gameOutcomes[i];
    if (outcome === 'win') winCount += 1;
    else if (outcome === 'lose') lossCount += 1;
    else tieCount += 1;
  }
  return { winCount, tieCount, lossCount };
};
const concludeGame = (gameOutcome, gameId, playerId) => {
  const gameContainer = document.querySelector('#game-container');
  const { winCount, lossCount, tieCount } = gameOutcome;
  let isWin = false;
  if (winCount > lossCount) {
    gameContainer.innerHTML += `<p>You have won with win/tie/loss: ${winCount}/${lossCount}/${tieCount}</p>`;
    isWin = true;
  }
  else {
    gameContainer.innerHTML += `<p>You have loss with win/tie/loss: ${winCount}/${lossCount}/${tieCount}</p>`;
  }
  createGameBtn.innerText = 'Start another game';
  document.body.appendChild(createGameBtn);
  document.body.removeChild(dealBtn);
  document.body.removeChild(refreshBtn);
  axios.put(`/games/${gameId}/winner`, { playerId, isWin })
    .then((response) => {
      console.log('response setting winner :>> ', response);
    })
    .catch((error) => {
      console.log('error in setting winner :>> ', error);
    });
};
const dealCards = function () {
  axios.put(`/games/${currentGame.id}/deal`)
    .then((response) => {
      // get the updated hand value
      currentGame = response.data;
      console.log('currentGame :>> ', currentGame);
      // display it to the user
      runGame(currentGame);

      const gameOutcome = countWinsTiesLosses(currentGame);
      if (gameOutcome.winCount === 3 || gameOutcome.lossCount === 3) {
        return concludeGame(gameOutcome, currentGame.id, currentGame.userId);
      }
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

const refreshCards = async () => {
  axios.get(`/games/${currentGame.id}`)
    .then((response) => {
      currentGame = response.data;
      runGame(currentGame);

      const gameContainer = document.querySelector('#game-container');
      const { winCount, tieCount, lossCount } = countWinsTiesLosses(currentGame);
      gameContainer.innerHTML += `<p>Wins: ${winCount} Ties: ${tieCount} Losses: ${lossCount}</p>`;
    })
    .catch((error) => {
      console.log('error in refeshing cards :>> ', error);
    });
};
const createGame = async () => {
  // Make a request to create a new game
  const opponent = await findMatch();
  console.log('matchingPartner :>> ', opponent);
  document.body.removeChild(createGameBtn);
  const gameContainer = document.querySelector('#game-container');
  gameContainer.innerHTML = '';

  axios.post('/games', { opponent })
    .then((response) => {
      // set the global value to the new game.
      currentGame = response.data;
      const { playerHand, opponentHand } = currentGame;
      console.log('currentGame :>> ', currentGame);
      // display it out to the user
      runGame(currentGame);
      // for this current game, create a button that will allow the user to
      // manipulate the deck that is on the DB.
      // Create a button for it.

      dealBtn.addEventListener('click', dealCards);
      dealBtn.innerText = 'Deal';
      document.body.appendChild(dealBtn);

      refreshBtn.addEventListener('click', refreshCards);
      refreshBtn.innerText = 'Refresh';
      document.body.appendChild(refreshBtn);
      // display the button
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

const checkLoggedIn = () => {
  axios.get('/isloggedin')
    .then((response) => {
      console.log('response from login :>> ', response);
      if (response.data.isLoggedIn === true)
      {
        document.body.appendChild(createGameBtn);
      }
      else {
        // render other buttons
        document.body.appendChild(loginBtn);
        document.body.appendChild(registrationBtn);
      }
    })
    .catch((error) => console.log('error from logging in', error));
};
// manipulate DOM, set up create game button
const regisLoginForm = function (buttonName) {
  const formContainer = document.querySelector('#form-container');

  formContainer.innerHTML = `<input placeholder="email" id="email">
  <input placeholder="password" id="password">
  <button id=${buttonName}>${buttonName}</button>`;
};

const submitRegisForm = async () => {
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  const errorContainer = document.querySelector('#error-container');

  await axios.post('/register', { email, password })
    .then((response) => {
      if (response.data.error)
      {
        throw response.data.error;
      }
      const formContainer = document.querySelector('#form-container');
      formContainer.innerHTML = '';
      errorContainer.innerHTML = '';
    })
    .catch((error) => {
      errorContainer.innerHTML = '<p style="color:red">Email is not valid</p>';
      console.log(error);
    });
  checkLoggedIn();
};
const submitLoginForm = async () => {
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  const errorContainer = document.querySelector('#error-container');

  await axios.post('/login', { email, password })
    .then((response) => {
      if (response.data.error)
      {
        throw response.data.error;
      }
      const formContainer = document.querySelector('#form-container');
      formContainer.innerHTML = '';
      errorContainer.innerHTML = '';
    })
    .catch((error) => {
      errorContainer.innerHTML = '<p style="color:red">Wrong email or password</p>';
      console.log(error);
    });
  checkLoggedIn();
};

const regisForm = () => {
  const formType = 'Register';
  regisLoginForm(formType);
  const submitButton = document.querySelector(`button[id=${formType}]`);
  submitButton.addEventListener('click', submitRegisForm);
  document.body.removeChild(loginBtn);
  document.body.removeChild(registrationBtn);
};

const loginForm = () => {
  const formType = 'Login';
  regisLoginForm(formType);
  const submitButton = document.querySelector(`button[id=${formType}]`);
  submitButton.addEventListener('click', submitLoginForm);
  document.body.removeChild(loginBtn);
  document.body.removeChild(registrationBtn);
};

registrationBtn.addEventListener('click', regisForm);
registrationBtn.innerText = 'Register';

loginBtn.addEventListener('click', loginForm);
loginBtn.innerText = 'Login';

createGameBtn.addEventListener('click', createGame);
createGameBtn.innerText = 'Start Game';

checkLoggedIn();
