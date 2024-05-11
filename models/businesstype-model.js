module.exports = (sequelize, Sequelize) => {
  const BusinessTypeModel = sequelize.define("businesstype", {
    businesstype_name: {
      type: Sequelize.STRING,
    }
  })

  return BusinessTypeModel
}