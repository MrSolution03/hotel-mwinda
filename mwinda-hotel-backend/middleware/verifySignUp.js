const db = require("../models");
const User = db.users;

const checkDuplicateEmail = (req, res, next) => {
  User.findOne({ where: { email: req.body.email } })
    .then(user => {
      if (user) {
        res.status(400).send({ message: "Erreur ! L'email est déjà utilisé !" });
        return;
      }
      next();
    });
};

const verifySignUp = { checkDuplicateEmail };
module.exports = verifySignUp;