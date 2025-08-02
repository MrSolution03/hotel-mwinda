module.exports = (sequelize, Sequelize) => {
  const Payment = sequelize.define("payments", {
    amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
    method: { type: Sequelize.ENUM('Airtel Money', 'M-Pesa'), allowNull: false },
    transactionId: { type: Sequelize.STRING },
    status: { type: Sequelize.ENUM('en attente', 'réussi', 'échoué'), defaultValue: 'en attente' },
    paymentDate: { type: Sequelize.DATE }
  });
  return Payment;
};