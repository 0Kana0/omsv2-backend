module.exports = (sequelize, Sequelize) => {
  const PTmaxPricetransactionModel = sequelize.define("ptmaxpricetransaction", {
    customer_id: {
      type: Sequelize.STRING,
    },
    transid: {
      type: Sequelize.INTEGER,
    },
    edctransid: {
      type: Sequelize.STRING,
    },
    maxcardno: {
      type: Sequelize.STRING,
    },
    amount: {
      type: Sequelize.STRING,
    },
    prodname: {
      type: Sequelize.STRING,
    },
    prodprice: {
      type: Sequelize.STRING,
    },
    prodqty: {
      type: Sequelize.STRING,
    },
    th_creatdt: {
      type: Sequelize.STRING,
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

  return PTmaxPricetransactionModel
}