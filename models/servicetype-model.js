module.exports = (sequelize, Sequelize) => {
  const ServiceTypeModel = sequelize.define("servicetype", {
    servicetype_name: {
      type: Sequelize.STRING,
    }
  })

  return ServiceTypeModel
}