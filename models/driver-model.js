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
    start_date: {
      type: Sequelize.DATEONLY,
    },
    resignation_date: {
      type: Sequelize.DATEONLY,
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