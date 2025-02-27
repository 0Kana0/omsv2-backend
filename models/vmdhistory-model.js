module.exports = (sequelize, Sequelize) => {
  const VmdHistoryModel = sequelize.define("vmdhistory", {
    date: {
      type: Sequelize.DATE,
    },
    approve: {
      type: Sequelize.STRING,
    },
    old_driver_name: {
      type: Sequelize.STRING,
    },
    new_driver_name: {
      type: Sequelize.STRING,
    },
    old_assistant_name: {
      type: Sequelize.STRING,
    },
    new_assistant_name: {
      type: Sequelize.STRING,
    },
    old_supervisor_name: {
      type: Sequelize.STRING,
    },
    new_supervisor_name: {
      type: Sequelize.STRING,
    },
  })

  return VmdHistoryModel
}