module.exports = (sequelize, Sequelize) => {
  const FleetCardTrackingModel = sequelize.define("fleetcardtracking", {
    date: {
      type: Sequelize.DATE,
    },
    plateNumber: {
      type: Sequelize.STRING,
    },
    fleetCardNumber: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
    },
    quantity: {
      type: Sequelize.STRING,
    },
    netAmount: {
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
    reason: {
      type: Sequelize.STRING,
    },
    verifiedBy: {
      type: Sequelize.STRING,
    },
  })

  return FleetCardTrackingModel
}