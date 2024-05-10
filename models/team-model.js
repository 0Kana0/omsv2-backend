module.exports = (sequelize, Sequelize) => {
  const TeamModel = sequelize.define("team", {
    team_name: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
    },
    forcast_number: {
      type: Sequelize.INTEGER,
    },
  })

  return TeamModel
}