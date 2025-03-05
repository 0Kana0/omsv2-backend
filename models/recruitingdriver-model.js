module.exports = (sequelize, Sequelize) => {
  const RecruitingDriverModel = sequelize.define("recruitingdriver", {
    recruit_team: {
      type: Sequelize.STRING,
    },
    recruit_status: {
      type: Sequelize.STRING,
    },
  })

  return RecruitingDriverModel
}