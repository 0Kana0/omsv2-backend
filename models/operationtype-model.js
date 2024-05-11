module.exports = (sequelize, Sequelize) => {
  const OperationTypeModel = sequelize.define("operationtype", {
    operationtype_name: {
      type: Sequelize.STRING,
    }
  })

  return OperationTypeModel
}