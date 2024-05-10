module.exports = (sequelize, Sequelize) => {
  const UserModel = sequelize.define('user', {
    name: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    image: {
      type: Sequelize.STRING,
    },
    loginStatus: {
      type: Sequelize.INTEGER,
    },
    role: {
      type: Sequelize.STRING,
      defaultValue: 'Staff'
    },
  })
  return UserModel
}