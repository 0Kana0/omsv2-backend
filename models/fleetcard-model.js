module.exports = (sequelize, Sequelize) => {
  const FleetCardModel = sequelize.define("fleetcard", {
    status: {
      type: Sequelize.STRING,
    },
    fleetCardNumber: {
      type: Sequelize.STRING,
    },
    plateNo: {
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

  return FleetCardModel
}