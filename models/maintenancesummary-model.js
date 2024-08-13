module.exports = (sequelize, Sequelize) => {
  const MaintenanceSummaryModel = sequelize.define('MaintenanceSummary', {
    check_code: {
      type: Sequelize.STRING,
    },
    inform_code: {
      type: Sequelize.STRING,
    },
    inform_date: {
      type: Sequelize.DATEONLY,
    },
    plateNumber: {
      type: Sequelize.STRING,
    },
    driver_name: {
      type: Sequelize.STRING,
    },
    distance_mile: {
      type: Sequelize.INTEGER,
    },
    problem_detail: {
      type: Sequelize.TEXT,
    },
    maintenance_detail: {
      type: Sequelize.TEXT,
    },
    maintenance_type: {
      type: Sequelize.STRING,
    },
    maintenance_weight: {
      type: Sequelize.STRING,
    },
    maintenance_status: {
      type: Sequelize.STRING,
    },
    quotation_number: {
      type: Sequelize.STRING,
    },
    repair_shop: {
      type: Sequelize.STRING,
    },
    payment: {
      type: Sequelize.STRING,
    },
    accounting_number: {
      type: Sequelize.STRING,
    },
    price: {
      type: Sequelize.DOUBLE,
    },
    driver_price: {
      type: Sequelize.DOUBLE,
    },
    driver_price_status: {
      type: Sequelize.BOOLEAN,
    },
    note: {
      type: Sequelize.TEXT,
    },
    sma_date: {
      type: Sequelize.DATEONLY,
    },
    pfma_date: {
      type: Sequelize.DATEONLY,
    },
    fma_date: {
      type: Sequelize.DATEONLY,
    },
    receive_date: {
      type: Sequelize.DATEONLY,
    },
    ma_file: {
      type: Sequelize.STRING,
      get() {
        const value = this.getDataValue('ma_file');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
          this.setDataValue('ma_file', JSON.stringify(value));
      }
    },
    note_front: {
      type: Sequelize.TEXT,
    },
    original_doc: {
      type: Sequelize.BOOLEAN,
    },
    cd_date: {
      type: Sequelize.DATEONLY,
    },
  })
  return MaintenanceSummaryModel
}