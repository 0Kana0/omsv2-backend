module.exports = (sequelize, Sequelize) => {
  const ShellFleetCardModel = sequelize.define("shellfleetcard", {
    date: {
      type: Sequelize.DATEONLY,
    },
    api_check: {
      type: Sequelize.BOOLEAN,
    },
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

  return ShellFleetCardModel
}