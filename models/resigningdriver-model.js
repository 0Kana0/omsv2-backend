module.exports = (sequelize, Sequelize) => {
  const ResigningDriverModel = sequelize.define("resigningdriver", {
    resign_date: {
      type: Sequelize.DATEONLY,
    },
    resign_driver: {
      type: Sequelize.STRING,
    },
    resign_reason: {
      type: Sequelize.STRING,
    },
    resign_specialCase: {
      type: Sequelize.BOOLEAN,
    },
    recruit_date: {
      type: Sequelize.DATEONLY,
    },
    recruit_reason: {
      type: Sequelize.STRING,
    },
    recruit_specialCase: {
      type: Sequelize.BOOLEAN,
    },
    detail: {
      type: Sequelize.TEXT,
    },
    detail_file: {
      type: Sequelize.STRING,
      get() {
        const value = this.getDataValue('detail_file');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
          this.setDataValue('detail_file', JSON.stringify(value));
      }
    },
    approve: {
      type: Sequelize.STRING,
    },
  })

  return ResigningDriverModel
}