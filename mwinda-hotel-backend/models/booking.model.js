module.exports = (sequelize, Sequelize) => {
  const Booking = sequelize.define("bookings", {
    arrivalDate: { type: Sequelize.DATE, allowNull: false },
    departureDate: { type: Sequelize.DATE, allowNull: false },
    totalPrice: { type: Sequelize.DECIMAL(10, 2) },
    status: { type: Sequelize.ENUM('en attente', 'confirmée', 'annulée'), defaultValue: 'en attente' }
  });
  return Booking;
};