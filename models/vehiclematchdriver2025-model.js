module.exports = (sequelize, Sequelize) => {
  const VehicleMatchDriver2025Model = sequelize.define("vehiclematchdriver2025", {
    date: {
      type: Sequelize.DATE,
    },
    driver_name: {
      type: Sequelize.STRING,
    },
    assistant_name: {
      type: Sequelize.STRING,
    },
    supervisor_name: {
      type: Sequelize.STRING,
    },
  })

  return VehicleMatchDriver2025Model
}