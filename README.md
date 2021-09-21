import db from './models/index.mjs';

// import your controllers here
import initBugsController from './controllers/bug.mjs';
import initUserController from './controllers/user.mjs';
import initFeatureController from './controllers/feature.mjs';

export default function bindRoutes(app) {
// initialize the controller functions here
const bugController = initBugsController(db);
const userController = initUserController(db);
const featureController = initFeatureController(db);
// pass in the db for all callbacks
app.get('/index', bugController.index);
app.get('/', bugController.create);
app.post('/', bugController.createForm);
app.get('/features', bugController.features);

app.post('/register', userController.create);
app.post('/login', userController.login);

// define your route matchers here using app
}
