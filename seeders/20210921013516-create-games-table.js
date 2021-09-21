module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Games', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      gameState: {
        // JSON allows us to store non-relational data easily.
        // Non-relational data refers to data that we may not query across records.
        // For the purposes of this project, where the focus is AJAX, let's store
        // all game state (e.g. cardDeck, playerHand) in the gameState JSON column.
        type: Sequelize.JSON,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Games');
  },
};
