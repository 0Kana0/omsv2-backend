module.exports = (sequelize, Sequelize) => {
  const VehicleRealtimeModel = sequelize.define("vehiclerealtime", {
    deviceNumber: {
      type: Sequelize.STRING,
    },
    plateNumber: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
    },
    deptName: {
      type: Sequelize.STRING,
    },
    time: {
      type: Sequelize.DATE,
    },
    su: {
      type: Sequelize.DECIMAL(4, 1),
    },
    lat: {
      type: Sequelize.STRING,
    },
    lon: {
      type: Sequelize.STRING,
    },
  })

  return VehicleRealtimeModel
}