module.exports = (sequelize, Sequelize) => {
  const UnitModel = sequelize.define("unit", {
    unit_name: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
    },
  })

  return UnitModel
}