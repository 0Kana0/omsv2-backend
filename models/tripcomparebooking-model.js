module.exports = (sequelize, Sequelize) => {
  const TripCompareBookingModel = sequelize.define("tripcomparebooking", {
    date: {
      type: Sequelize.DATE,
    },
    compareStatus: {
      type: Sequelize.STRING,
    },
    clarification: {
      type: Sequelize.STRING,
    },
  })

  return TripCompareBookingModel
}