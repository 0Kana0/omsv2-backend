module.exports = (sequelize, Sequelize) => {
  const VehicleBookingStatus2024Model = sequelize.define("vehiclebookingstatus2024", {
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
    available_start: {
      type: Sequelize.DATE,
    },
    available_end: {
      type: Sequelize.DATE,
    },
    ownerRental: {
      type: Sequelize.STRING,
    },
    ownedBy: {
      type: Sequelize.STRING,
    },
    rentalBy: {
      type: Sequelize.STRING,
    },
    replacement: {
      type: Sequelize.STRING,
    },
    lateStatus: {
      type: Sequelize.STRING,
    },
  })

  return VehicleBookingStatus2024Model
}