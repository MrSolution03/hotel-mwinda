// mwinda-hotel-backend/server.js

const express = require("express");
const cors = require("cors");
const morgan = require("morgan"); // <-- 1. Importer morgan
require('dotenv').config();

const app = express();

const corsOptions = {
  origin: "http://localhost:5173" // Port du frontend
};
app.use(cors(corsOptions));

// 2. Utiliser morgan pour logger toutes les requêtes entrantes
// Cela doit être placé avant la définition de vos routes.
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

const db = require("./models");

db.sequelize.sync({ force: false }).then(() => {
  console.log("Base de données synchronisée.");
});

app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API complète de Mwinda Hotel." });
});

// === C'EST ICI QUE TOUT EST CHARGÉ ===
require('./routes/auth.routes')(app);
require('./routes/room.routes')(app);
require('./routes/booking.routes')(app);
require('./routes/user.routes')(app);
require('./routes/dashboard.routes')(app);
require('./routes/admin.routes.js')(app);
require('./routes/admin.routes.js')(app);
require('./routes/image.routes.js')(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Le serveur tourne sur le port ${PORT}.`);
});