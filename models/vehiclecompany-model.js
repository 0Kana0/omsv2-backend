module.exports = (sequelize, Sequelize) => {
  const VehicleCompanyModel = sequelize.define("vehiclecompany", {
    vehiclecompany_name: {
      type: Sequelize.STRING,
    }
  })

  return VehicleCompanyModel
}