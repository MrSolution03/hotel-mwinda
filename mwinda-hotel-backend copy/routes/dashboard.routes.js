const { authJwt } = require("../middleware");
const controller = require("../controllers/dashboard.controller");

module.exports = function(app) {
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
        next();
    });

    // Route sécurisée pour les statistiques du tableau de bord administrateur
    app.get(
        "/api/dashboard/stats",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.getAdminStats
    );
};