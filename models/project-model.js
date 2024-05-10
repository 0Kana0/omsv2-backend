module.exports = (sequelize, Sequelize) => {
  const ProjectModel = sequelize.define("project", {
    project_name: {
      type: Sequelize.STRING,
    }
  })

  return ProjectModel
}