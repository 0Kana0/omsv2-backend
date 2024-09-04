module.exports = (sequelize, Sequelize) => {
  const ShellTransactionModel = sequelize.define("shelltransaction", {
    date: {
      type: Sequelize.DATEONLY,
    },
    authorisationCode: {
      type: Sequelize.STRING,
    },
    cardPAN: {
      type: Sequelize.STRING,
    },
    vehicleRegistration: {
      type: Sequelize.STRING,
    },
    postingDate: {
      type: Sequelize.DATE,
    },
    quantity: {
      type: Sequelize.DOUBLE,
    },
    unitPriceInTransactionCurrency: {
      type: Sequelize.DOUBLE,
    },
    transactionNetAmount: {
      type: Sequelize.DOUBLE,
    },
    location: {
      type: Sequelize.STRING,
    },
    branchName: {
      type: Sequelize.TEXT,
    },
  })

  return ShellTransactionModel
}