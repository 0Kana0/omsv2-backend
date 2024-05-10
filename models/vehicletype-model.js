module.exports = (sequelize, Sequelize) => {
  const VehicleTypeModel = sequelize.define("vehicletype", {
    vehicletype_name: {
      type: Sequelize.STRING,
    }
  })

  return VehicleTypeModel
}