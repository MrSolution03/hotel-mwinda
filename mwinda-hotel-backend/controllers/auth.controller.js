const db = require("../models");
const config = require("../config/auth.config");
const transporter = require("../config/mail.config"); // Importer le transporteur d'email
const User = db.users;

const { Op } = require("sequelize");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); // Module natif de Node pour la cryptographie
exports.signup = async (req, res) => {
  try {
    // Si la requête demande de créer un admin, on vérifie la limite
    if (req.body.role === 'admin') {
      const adminCount = await User.count({ where: { role: 'admin' } });
      if (adminCount >= 3) {
        return res.status(403).send({ message: "Limite de 3 administrateurs atteinte." });
      }
    }

    await User.create({
      fullName: req.body.fullName,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      role: req.body.role || 'client'
    });
    res.send({ message: "Utilisateur enregistré avec succès !" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.signin = (req, res) => {
  User.findOne({ where: { email: req.body.email } })
  .then(user => {
    if (!user) return res.status(404).send({ message: "Utilisateur non trouvé." });

    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ accessToken: null, message: "Mot de passe incorrect !" });
    }

    const token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 86400 });

    res.status(200).send({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      accessToken: token
    });
  })
  .catch(err => res.status(500).send({ message: err.message }));
};

// NOUVELLE FONCTION : MOT DE PASSE OUBLIÉ
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).send({ message: "Aucun utilisateur trouvé avec cette adresse e-mail." });
    }

    // Générer un token sécurisé
    const token = crypto.randomBytes(20).toString('hex');

    // Sauvegarder le token et sa date d'expiration (ex: 1 heure)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    await user.save();

    // Envoyer l'e-mail
    // NOTE: Le lien pointe vers l'application frontend, qui se chargera d'appeler l'API de réinitialisation
    const resetURL = `http://localhost:5173/reset-password/${token}`; // URL du frontend

    const mailOptions = {
      from: `"Mwinda Hotel Support" <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      text: `Vous recevez cet e-mail car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.\n\n` +
            `Veuillez cliquer sur le lien suivant, ou le coller dans votre navigateur pour terminer le processus :\n\n` +
            `${resetURL}\n\n` +
            `Si vous n'avez pas demandé cela, veuillez ignorer cet e-mail et votre mot de passe restera inchangé.\n`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send({ message: 'Un e-mail de réinitialisation a été envoyé à ' + user.email + '.' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// NOUVELLE FONCTION : RÉINITIALISER LE MOT DE PASSE
exports.resetPassword = async (req, res) => {
  try {
    // Retrouver l'utilisateur grâce au token, et vérifier que le token n'est pas expiré
    const user = await User.findOne({
      where: {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { [Op.gt]: Date.now() } // Op.gt signifie "greater than"
      }
    });

    if (!user) {
      return res.status(400).send({ message: 'Le token de réinitialisation est invalide ou a expiré.' });
    }

    // Le token est valide, on peut réinitialiser le mot de passe
    user.password = bcrypt.hashSync(req.body.password, 8);
    user.resetPasswordToken = null; // Invalider le token
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).send({ message: 'Votre mot de passe a été mis à jour avec succès.' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};