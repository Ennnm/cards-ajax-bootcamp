import db from './models/index.mjs';
import { getHash } from './util.mjs';

import initGamesController from './controllers/games.mjs';
import initUserController from './controllers/user.mjs';

const checkLoggedIn = (req, res) => {
  const { loggedIn, userId } = req.cookies;
  let isLoggedIn = false;
  if (loggedIn && userId && loggedIn === getHash(userId))
  {
    isLoggedIn = true;
    req.body.isLoggedIn = true;
  }
  res.send({ isLoggedIn });
};

export default function bindRoutes(app) {
  const gamesController = initGamesController(db);
  const userController = initUserController(db);
  // main page
  app.get('/', gamesController.index);
  // create a new game
  app.post('/games', gamesController.create);
  // update a game with new cards
  app.put('/games/:id/winner', gamesController.setWinner);
  app.put('/games/:id/deal', gamesController.deal);
  app.get('/games/:id', gamesController.show);

  app.get('/isloggedin', checkLoggedIn);
  app.post('/register', userController.register);
  app.post('/login', userController.login);

  app.get('/findmatch', userController.findMatch);
}
