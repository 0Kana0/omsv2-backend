module.exports = (sequelize, Sequelize) => {
  const RecruitingDriverModel = sequelize.define("recruitingdriver", {
    appointment_date: {
      type: Sequelize.DATEONLY,
    },
    fullName: {
      type: Sequelize.STRING,
    },
    phone: {
      type: Sequelize.STRING,
    },
    reason: {
      type: Sequelize.STRING,
    },
    note: {
      type: Sequelize.STRING,
    },
    driver_file: {
      type: Sequelize.STRING,
      get() {
        const value = this.getDataValue('driver_file');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
          this.setDataValue('driver_file', JSON.stringify(value));
      }
    },
    recruit_status: {
      type: Sequelize.STRING,
    },
    approve: {
      type: Sequelize.STRING,
    },
  })

  return RecruitingDriverModel
}