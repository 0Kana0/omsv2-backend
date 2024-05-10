module.exports = (sequelize, Sequelize) => {
  const CustomerModel = sequelize.define("customer", {
    customer_name: {
      type: Sequelize.STRING,
    }
  })

  return CustomerModel
}