module.exports = (sequelize, Sequelize) => {
  const DailyStatusModel = sequelize.define("dailystatus", {
    date: {
      type: Sequelize.DATE,
    },
    emailStatus: {
      type: Sequelize.STRING,
    },
    notifyStatus: {
      type: Sequelize.STRING,
    }
  })

  return DailyStatusModel
}