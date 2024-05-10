module.exports = (sequelize, Sequelize) => {
  const DepartmentModel = sequelize.define("department", {
    departmentName: {
      type: Sequelize.STRING,
    },
    departmentID: {
      type: Sequelize.STRING,
    },
  })

  return DepartmentModel
}