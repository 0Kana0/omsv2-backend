module.exports = (sequelize, Sequelize) => {
  const SectorModel = sequelize.define("sector", {
    sector_name: {
      type: Sequelize.STRING,
    }
  })

  return SectorModel
}