module.exports = (sequelize, Sequelize) => {
  const NetworkModel = sequelize.define("network", {
    network_name: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
    },
  })

  return NetworkModel
}