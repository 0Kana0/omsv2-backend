

module.exports = (sequelize, Sequelize) => {
  const LazadaPUOModel = sequelize.define("lazadapuo", {
    toWarehouseCode: {
      type: Sequelize.STRING,
    },
    expectPickUpTime: {
      type: Sequelize.DATE,
    },
    weight: {
      type: Sequelize.INTEGER,
    },
    timeZone: {
      type: Sequelize.STRING,
    },
    volume: {
      type: Sequelize.INTEGER,
    },
    bizOrderCodeList: {
      type: Sequelize.STRING,
      get() {
        const value = this.getDataValue('bizOrderCodeList');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
          this.setDataValue('bizOrderCodeList', JSON.stringify(value));
      }
    },
    uniqueCode: {
      type: Sequelize.STRING,
    },
    pickUpOrderCode: {
      type: Sequelize.STRING,
    },
    attributes: {
      type: Sequelize.STRING,
    },
    packageCount: {
      type: Sequelize.INTEGER,
    },
    storeOrderCodeList: {
      type: Sequelize.STRING,
      get() {
        const value = this.getDataValue('storeOrderCodeList');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
          this.setDataValue('storeOrderCodeList', JSON.stringify(value));
      }
    },
  })

  return LazadaPUOModel
}