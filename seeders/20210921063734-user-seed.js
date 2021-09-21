const util = require('../util.js');
// import util from '../util.mjs';

module.exports = {
  up: async (queryInterface) => {
    const users = ['just', 'in'];
    const userObjs = [];
    users.forEach((user) => userObjs.push({
      email: `${user}@gmail.com`,
      password: util.getHash(user),
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert('users', userObjs);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};
