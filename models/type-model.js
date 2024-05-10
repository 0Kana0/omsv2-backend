module.exports = (sequelize, Sequelize) => {
  const TypeModel = sequelize.define("type", {
    type_name: {
      type: Sequelize.STRING,
    }
  })

  return TypeModel
}