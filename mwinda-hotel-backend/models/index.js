// models/index.js

const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

let sequelize;

// Si une variable DATABASE_URL est fournie (comme pour Supabase ou Render), on l'utilise en priorité.
// C'est la configuration pour la production et les tests en ligne.
if (process.env.DATABASE_URL) {
    console.log("INFO: Connexion à la base de données via DATABASE_URL.");
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // Important pour les plateformes comme Render/Heroku
            }
        },
        logging: false
    });
} else {
    // Sinon, on utilise la configuration "classique" du fichier db.config.js pour le développement local.
    console.log("INFO: Connexion à la base de données via la configuration locale.");
    const config = {
        host: dbConfig.HOST,
        port: dbConfig.PORT,
        dialect: dbConfig.dialect,
        pool: { 
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: false 
    };
    sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, config);
}

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