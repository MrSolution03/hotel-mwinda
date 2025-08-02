const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
    next();
  });

  app.post("/api/auth/signup", [verifySignUp.checkDuplicateEmail], controller.signup);
  app.post("/api/auth/signin", controller.signin);

  // NOUVELLES ROUTES POUR LE MOT DE PASSE
  app.post("/api/auth/forgot-password", controller.forgotPassword);
  app.post("/api/auth/reset-password/:token", controller.resetPassword);
};