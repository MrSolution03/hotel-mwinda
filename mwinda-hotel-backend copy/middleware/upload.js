// middleware/upload.js
const multer = require('multer');
const cloudinary = require('../config/cloudinary.config');
const { Readable } = require('stream');

// Utiliser memoryStorage pour garder le fichier en mémoire sous forme de buffer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadToCloudinary = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next(); // Pas de fichiers, on passe au contrôleur suivant
    }

    try {
        const uploadPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { 
                        // Optionnel : un dossier dans votre médiathèque Cloudinary
                        folder: "mwinda_hotel" 
                    },
                    (error, result) => {
                        if (error) {
                            return reject(error);
                        }
                        // On retourne l'URL sécurisée de l'image uploadée
                        resolve(result.secure_url);
                    }
                );
                // On transforme le buffer du fichier en un flux lisible et on le pipe vers Cloudinary
                Readable.from(file.buffer).pipe(uploadStream);
            });
        });

        // Attendre que tous les uploads soient terminés
        const uploadedUrls = await Promise.all(uploadPromises);

        // Stocker les URLs publiques des fichiers dans la requête pour le contrôleur
        req.cloudinaryUrls = uploadedUrls;
        
        next();
    } catch (error) {
        console.error("Erreur d'upload Cloudinary:", error);
        res.status(500).send({ message: "Erreur lors de l'upload des images." });
    }
};

module.exports = {
    upload,
    uploadToCloudinary
};