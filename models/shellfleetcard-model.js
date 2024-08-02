module.exports = (sequelize, Sequelize) => {
  const ShellFleetCardModel = sequelize.define("shellfleetcard", {
    status: {
      type: Sequelize.STRING,
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
    api_check: {
      type: Sequelize.BOOLEAN,
    },
    monitor_check: {
      type: Sequelize.BOOLEAN,
    },
  })

  return ShellFleetCardModel
}