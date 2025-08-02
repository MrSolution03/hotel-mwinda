module.exports = (sequelize, Sequelize) => {
  const Room = sequelize.define("rooms", {
    type: { type: Sequelize.STRING, allowNull: false },
    pricePerNight: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
    status: { type: Sequelize.ENUM('disponible', 'occupée', 'maintenance'), defaultValue: 'disponible' },
    description: { type: Sequelize.TEXT },
    amenities: { type: Sequelize.JSON }
  });
  return Room;
};