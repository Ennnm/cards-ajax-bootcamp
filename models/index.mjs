import { Sequelize } from 'sequelize';
import allConfig from '../config/config.js';

import gameModel from './game.mjs';
import userModel from './user.mjs';
import loginsModel from './logins.mjs';

const env = process.env.NODE_ENV || 'development';

const config = allConfig[env];

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

// add your model definitions to db here
db.Game = gameModel(sequelize, Sequelize.DataTypes);
db.User = userModel(sequelize, Sequelize.DataTypes);
db.LoginToken = loginsModel(sequelize, Sequelize.DataTypes);
// TODO CREATE LOGIN FOR USER

// db.Game.belongsToMany(db.User, { through: 'game_users' });
db.Game.belongsToMany(db.User, { through: 'game_users' });

db.Game.belongsTo(db.User, {
  as: 'winner',
  foreignKey: 'winner_id',
});
// db.User.belongsToMany(db.Game, { through: 'game_users' });
db.User.belongsToMany(db.Game, { through: 'game_users' });

db.User.hasOne(db.LoginToken);
db.LoginToken.belongsTo(db.User);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
