module.exports = (sequelize, Sequelize) => {
  const LazadaReceiverModel = sequelize.define("lazadareceiver", {
    pickUpOrderCode: {
      type: Sequelize.STRING,
    },
    country: {
      type: Sequelize.STRING,
    },
    address: {
      type: Sequelize.STRING,
    },
    province: {
      type: Sequelize.STRING,
    },
    phone: {
      type: Sequelize.STRING,
    },
    city: {
      type: Sequelize.STRING,
    },
    name: {
      type: Sequelize.STRING,
    },
    county: {
      type: Sequelize.STRING,
    }
  })

  return LazadaReceiverModel
}