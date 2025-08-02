const nodemailer = require('nodemailer');

// Configurez le transporteur d'e-mails en utilisant les variables d'environnement
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, // true pour le port 465, false pour les autres
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

module.exports = transporter;