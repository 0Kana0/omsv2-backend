module.exports = (sequelize, Sequelize) => {
  const VehicleMatchDriverModel = sequelize.define("vehiclematchdriver", {
    driver_name: {
      type: Sequelize.STRING,
    },
    assistant_name: {
      type: Sequelize.STRING,
    },
    supervisor_name: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
    },
  })

  return VehicleMatchDriverModel
}