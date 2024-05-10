module.exports = (sequelize, Sequelize) => {
  const SuppliersAlertModel = sequelize.define("suppliersalert", {
    kdr_length: {
      type: Sequelize.INTEGER,
    }
  })

  return SuppliersAlertModel
}