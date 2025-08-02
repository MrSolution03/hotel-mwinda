// models/index.js

const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

// --- CONFIGURATION DE SEQUELIZE ---
// Créer un objet de configuration de base
const config = {
  host: dbConfig.HOST,
  port: dbConfig.PORT, // <-- AJOUTER CETTE LIGNE
  dialect: dbConfig.dialect,
  pool: { ...dbConfig.pool },
  logging: false 
};

// Ajouter la configuration SSL UNIQUEMENT en environnement de production
if (process.env.NODE_ENV === 'production') {
  config.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false 
    }
  };
}

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, config);
// --- FIN DE LA CONFIGURATION ---


const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importation des modèles
db.users = require("./user.model.js")(sequelize, Sequelize);
db.rooms = require("./room.model.js")(sequelize, Sequelize);
db.roomImages = require("./roomImage.model.js")(sequelize, Sequelize);
db.bookings = require("./booking.model.js")(sequelize, Sequelize);
db.payments = require("./payment.model.js")(sequelize, Sequelize);
db.invoices = require("./invoice.model.js")(sequelize, Sequelize);

// Définition des relations
db.users.hasMany(db.bookings, { foreignKey: "userId", as: "bookings", onDelete: 'CASCADE' });
db.bookings.belongsTo(db.users, { foreignKey: "userId", as: "user" });

db.rooms.hasMany(db.bookings, { foreignKey: "roomId", as: "bookings" });
db.bookings.belongsTo(db.rooms, { foreignKey: "roomId", as: "room" });

db.rooms.hasMany(db.roomImages, { as: "images", onDelete: 'CASCADE' });
db.roomImages.belongsTo(db.rooms, { foreignKey: "roomId", as: "room" });

db.bookings.hasOne(db.payments, { foreignKey: 'bookingId', as: 'payment', onDelete: 'CASCADE' });
db.payments.belongsTo(db.bookings, { foreignKey: 'bookingId', as: 'booking' });

db.bookings.hasOne(db.invoices, { foreignKey: 'bookingId', as: 'invoice', onDelete: 'CASCADE' });
db.invoices.belongsTo(db.bookings, { foreignKey: 'bookingId', as: 'booking' });

module.exports = db;