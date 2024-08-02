module.exports = (sequelize, Sequelize) => {
  const PTmaxTransactionModel = sequelize.define("ptmaxtransaction", {
    customer_id: {
      type: Sequelize.STRING,
    },
    transid: {
      type: Sequelize.STRING,
    },
    edctransid: {
      type: Sequelize.STRING,
    },
    maxcardno: {
      type: Sequelize.STRING,
    },
    amount: {
      type: Sequelize.DOUBLE,
    },
    prodname: {
      type: Sequelize.STRING,
    },
    prodprice: {
      type: Sequelize.DOUBLE,
    },
    prodqty: {
      type: Sequelize.DOUBLE,
    },
    th_creatdt: {
      type: Sequelize.DATE,
    },
    companyname: {
      type: Sequelize.STRING,
    },
    branchname: {
      type: Sequelize.STRING,
    },
    drivername: {
      type: Sequelize.STRING,
    },
    driverlicence: {
      type: Sequelize.STRING,
    },
    driverphone: {
      type: Sequelize.STRING,
    },
    balance: {
      type: Sequelize.DOUBLE,
    },
    mileage: {
      type: Sequelize.STRING,
    },
  })

  return PTmaxTransactionModel
}