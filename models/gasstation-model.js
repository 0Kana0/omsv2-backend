module.exports = (sequelize, Sequelize) => {
  const GasStationModel = sequelize.define("gasstation", {
    gasstation_name: {
      type: Sequelize.STRING,
    }
  })

  return GasStationModel
}