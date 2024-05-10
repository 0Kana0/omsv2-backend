module.exports = (sequelize, Sequelize) => {
  const MonthModel = sequelize.define("month", {
    month_name: {
      type: Sequelize.STRING,
    }
  })

  return MonthModel
}