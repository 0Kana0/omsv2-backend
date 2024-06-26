module.exports = (sequelize, Sequelize) => {
  const TripDetailModel = sequelize.define("tripdetail", {
    JobOrderNumber: {
      type: Sequelize.STRING,
    },
    date: {
      type: Sequelize.DATE,
    },
    numberoftrip: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    },
    totalDistance: {
      type: Sequelize.INTEGER,
    },
    remark: {
      type: Sequelize.STRING,
    },
    plateNumber: {
      type: Sequelize.STRING,
    },
    driverOne: {
      type: Sequelize.STRING,
    },
    driverTwo: {
      type: Sequelize.STRING,
    },
    fleetCardNumber: {
      type: Sequelize.STRING,
    },
    createBy: {
      type: Sequelize.STRING,
    },
    updateBy: {
      type: Sequelize.STRING,
    },
  })

  return TripDetailModel
}