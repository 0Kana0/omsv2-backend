module.exports = (sequelize, Sequelize) => {
  const DriverModel = sequelize.define("driver", {
    driverNumber: {
      type: Sequelize.STRING,
    },
    prefixName: {
      type: Sequelize.STRING,
    },
    name: {
      type: Sequelize.STRING,
    },
    surName: {
      type: Sequelize.STRING,
    },
    fullName: {
      type: Sequelize.STRING,
    },
    birthDate: {
      type: Sequelize.DATE,
    },
    idCard: {
      type: Sequelize.STRING,
    },
    phone: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
    },
    role: {
      type: Sequelize.STRING,
    },
  })

  return DriverModel
}