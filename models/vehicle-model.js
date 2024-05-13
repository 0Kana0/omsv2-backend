module.exports = (sequelize, Sequelize) => {
  const VehicleModel = sequelize.define("vehicle", {
    plateNumber: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
    },
    vehicleIdentificationNumber: {
      type: Sequelize.STRING,
    },
    engineNumber: {
      type: Sequelize.STRING,
    },
    brand: {
      type: Sequelize.STRING,
    },
  })

  return VehicleModel
}