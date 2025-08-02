// controllers/image.controller.js
const fs = require('fs');
const path = require('path');
const db = require("../models");
const RoomImage = db.roomImages;

exports.deleteImage = async (req, res) => {
    const id = req.params.id;
    try {
        const image = await RoomImage.findByPk(id);
        if (!image) return res.status(404).send({ message: 'Image non trouvée.' });

        const filePath = path.join(__dirname, '..', image.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await RoomImage.destroy({ where: { id: id } });
        res.send({ message: "Image supprimée avec succès." });
    } catch (err) {
        res.status(500).send({ message: "Erreur lors de la suppression de l'image." });
    }
};