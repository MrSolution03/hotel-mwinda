// routes/image.routes.js
const { authJwt } = require("../middleware");
const controller = require("../controllers/image.controller");

module.exports = function(app) {
    app.delete("/api/images/:id", [authJwt.verifyToken, authJwt.isAdmin], controller.deleteImage);
};