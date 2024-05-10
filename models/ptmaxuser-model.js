module.exports = (sequelize, Sequelize) => {
  const PTmaxUserModel = sequelize.define('ptmaxuser', {
    username: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
  })
  return PTmaxUserModel
}