module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    fullName: { type: Sequelize.STRING, allowNull: false },
    email: { type: Sequelize.STRING, allowNull: false, unique: true },
    password: { type: Sequelize.STRING, allowNull: false },
    phoneNumber: { type: Sequelize.STRING },
    address: { type: Sequelize.STRING },
    role: { type: Sequelize.ENUM('client', 'admin'), defaultValue: 'client' },
    // AJOUTS POUR LE RESET DE MOT DE PASSE
    resetPasswordToken: {
      type: Sequelize.STRING,
      allowNull: true
    },
    resetPasswordExpires: {
      type: Sequelize.DATE,
      allowNull: true
    }
  });
  return User;
};