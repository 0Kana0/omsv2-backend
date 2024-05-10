module.exports = (sequelize, Sequelize) => {
  const ClientModel = sequelize.define("client", {
    client_code: {
      type: Sequelize.STRING,
    },
    client_name_TH: {
      type: Sequelize.STRING,
    },
    client_name_EN: {
      type: Sequelize.STRING,
    },
    address: {
      type: Sequelize.STRING,
    },
    postal_code: {
      type: Sequelize.INTEGER,
    },
    tax_ID: {
      type: Sequelize.STRING,
    },
    credit_term: {
      type: Sequelize.STRING,
    }
  })
  return ClientModel
}