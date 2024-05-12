module.exports = (sequelize, Sequelize) => {
  const VehicleBookingStatusModel = sequelize.define("vehiclebookingstatus", {
    date: {
      type: Sequelize.DATE,
    },
    status: {
      type: Sequelize.STRING,
    },
    remark: {
      type: Sequelize.STRING,
    },
    issueDate: {
      type: Sequelize.DATE,
    },
    forecastCompleteDate: {
      type: Sequelize.DATE,
    },
    completeDate: {
      type: Sequelize.DATE,
    },
    problemIssue: {
      type: Sequelize.STRING,
    },
    reason: {
      type: Sequelize.STRING,
    },
    prepared: {
      type: Sequelize.STRING,
    },
    approve: {
      type: Sequelize.STRING,
    },
    approveStatus: {
      type: Sequelize.STRING,
    },
    available: {
      type: Sequelize.STRING,
    },
  })

  return VehicleBookingStatusModel
}