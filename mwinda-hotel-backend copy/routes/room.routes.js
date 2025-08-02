// routes/room.routes.js

const { authJwt } = require("../middleware");
const controller = require("../controllers/room.controller");
// Importer les deux middlewares depuis notre fichier d'upload mis à jour
const { upload, uploadToCloudinary } = require("../middleware/upload"); 

module.exports = function(app) {
    app.use((req, res, next) => {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // --- ORDRE CORRECT DES ROUTES ---

    app.get("/api/rooms", controller.findAll);
    app.get("/api/rooms/types", controller.findAllTypes);
    
    // Route pour supprimer une image spécifique (ne nécessite pas d'upload)
    app.delete("/api/rooms/image/:imageId", [authJwt.verifyToken, authJwt.isAdmin], controller.deleteImage);

    // Routes qui gèrent l'upload d'images
    app.post("/api/rooms", [authJwt.verifyToken, authJwt.isAdmin, upload.array('images', 10), uploadToCloudinary], controller.create);
    app.put("/api/rooms/:id", [authJwt.verifyToken, authJwt.isAdmin, upload.array('images', 10), uploadToCloudinary], controller.update);

    // Routes génériques
    app.get("/api/rooms/:id", controller.findOne);
    app.delete("/api/rooms/:id", [authJwt.verifyToken, authJwt.isAdmin], controller.delete);
};