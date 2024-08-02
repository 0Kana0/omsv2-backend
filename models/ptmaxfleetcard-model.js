module.exports = (sequelize, Sequelize) => {
  const PTmaxFleetCardModel = sequelize.define("ptmaxfleetcard", {
    fleetCardNumber: {
      type: Sequelize.STRING,
    },
    plateNumber: {
      type: Sequelize.STRING,
    },
    employeeName_sheet: {
      type: Sequelize.STRING,
    },
    subcontractorsName_sheet: {
      type: Sequelize.STRING,
    },
    project_sheet: {
      type: Sequelize.STRING,
    },
    team_sheet: {
      type: Sequelize.STRING,
    },
  })

  return PTmaxFleetCardModel
}