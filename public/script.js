// global value that holds info about the current hand.
let currentGame = null;

// create game btn
const createGameBtn = document.createElement('button');
const loginBtn = document.createElement('button');
const registrationBtn = document.createElement('button');

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
  const currPlayerContainer = document.createElement('div');
  const oppPlayerContainer = document.createElement('div');

  currPlayerContainer.style.display = 'inline-block';
  oppPlayerContainer.style.display = 'inline-block';

  oppPlayerContainer.style.margin = '20px';
  oppPlayerContainer.style.margin = '20px';

  const gameStatus = document.createElement('p');

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

  gameStatus.innerText = `You ${currPlayerGameStatus(playerHand, opponentHand)}`;

  gameContainer.appendChild(currPlayerContainer);
  gameContainer.appendChild(oppPlayerContainer);
  gameContainer.appendChild(gameStatus);
};

// make a request to the server
// to change the deck. set 2 new cards into the player hand.
const dealCards = function () {
  axios.put(`/games/${currentGame.id}/deal`)
    .then((response) => {
      // get the updated hand value
      currentGame = response.data;
      console.log('currentGame :>> ', currentGame);
      // display it to the user
      runGame(currentGame);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

const createGame = async () => {
  // Make a request to create a new game
  const matchingPartner = await findMatch();
  console.log('matchingPartner :>> ', matchingPartner);

  // const dealBtn = '<button id="deal>Deal</button>';
  // dealBtn.addEventListener('click', dealCards);
  // document.body.appendChild(dealBtn);

  axios.post('/games')
    .then((response) => {
      // set the global value to the new game.
      currentGame = response.data;
      const { playerHand, opponentHand } = currentGame;
      console.log('currentGame :>> ', currentGame);
      // display it out to the user
      runGame(currentGame);
      const currPlayerStatus = currPlayerGameStatus(playerHand, opponentHand);
      // for this current game, create a button that will allow the user to
      // manipulate the deck that is on the DB.
      // Create a button for it.
      const dealBtn = document.createElement('button');
      dealBtn.addEventListener('click', dealCards);
      document.body.appendChild(dealBtn);

      // display the button
      dealBtn.innerText = 'Deal';
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
