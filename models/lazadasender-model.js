module.exports = (sequelize, Sequelize) => {
  const LazadaSenderModel = sequelize.define("lazadasender", {
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

  return LazadaSenderModel
}