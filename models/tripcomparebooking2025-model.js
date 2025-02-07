module.exports = (sequelize, Sequelize) => {
  const TripCompareBooking2025Model = sequelize.define("tripcomparebooking2025", {
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

  return TripCompareBooking2025Model
}