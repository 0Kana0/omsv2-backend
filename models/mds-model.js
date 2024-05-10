module.exports = (sequelize, Sequelize) => {
  const MDSModel = sequelize.define("mds", {
    mds: {
      type: Sequelize.STRING,
    },
    mds_outsource: {
      type: Sequelize.STRING,
    },
  })

  return MDSModel
}