const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.users;

const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({ message: "Aucun token fourni !" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Non autorisé !" });
    }
    req.userId = decoded.id;
    next();
  });
};

const isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    if (user.role === 'admin') {
      next();
      return;
    }
    res.status(403).send({ message: "Rôle d'administrateur requis !" });
  });
};

const authJwt = {
  verifyToken,
  isAdmin
};
module.exports = authJwt;