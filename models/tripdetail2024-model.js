module.exports = (sequelize, Sequelize) => {
  const TripDetail2024Model = sequelize.define("tripdetail2024", {
    JobOrderNumber: {
      type: Sequelize.STRING,
    },
    date: {
      type: Sequelize.DATE,
    },
    numberoftrip: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    },
    totalDistance: {
      type: Sequelize.INTEGER,
    },
    remark: {
      type: Sequelize.STRING,
    },
    plateNumber: {
      type: Sequelize.STRING,
    },
    driverOne: {
      type: Sequelize.STRING,
    },
    driverTwo: {
      type: Sequelize.STRING,
    },
    fleetCardNumber: {
      type: Sequelize.STRING,
    },
    mile_start: {
      type: Sequelize.DOUBLE,
    },
    mile_end: {
      type: Sequelize.DOUBLE,
    },
    quantity: {
      type: Sequelize.DOUBLE,
    },
    lateStatus: {
      type: Sequelize.STRING,
    },
    barcode_number: {
      type: Sequelize.STRING,
    },
    route_number: {
      type: Sequelize.STRING,
    },
    job_code: {
      type: Sequelize.STRING,
    },
    createBy: {
      type: Sequelize.STRING,
    },
    updateBy: {
      type: Sequelize.STRING,
    },
  })

  return TripDetail2024Model
}