module.exports = (sequelize, Sequelize) => {
  const VbkHistoryModel = sequelize.define("vbkhistory", {
    date: {
      type: Sequelize.DATE,
    },
    approve: {
      type: Sequelize.STRING,
    },
  })

  return VbkHistoryModel
}