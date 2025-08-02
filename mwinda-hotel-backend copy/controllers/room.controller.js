// controllers/room.controller.js
const fs = require('fs');
const path = require('path');
const db = require("../models");
const Room = db.rooms;
const RoomImage = db.roomImages;
const { Op } = require("sequelize");
const cloudinary = require('../config/cloudinary.config');

// --- CREATE ---
exports.create = async (req, res) => {
    const { type, pricePerNight, description, amenities } = req.body;
    const t = await db.sequelize.transaction();
    try {
        const room = await Room.create({ type, pricePerNight, description, amenities: JSON.parse(amenities) }, { transaction: t });
        
        // Utiliser les URLs Cloudinary fournies par le middleware
        if (req.cloudinaryUrls && req.cloudinaryUrls.length > 0) {
            const imageRecords = req.cloudinaryUrls.map(url => ({ url: url, roomId: room.id }));
            await RoomImage.bulkCreate(imageRecords, { transaction: t });
        }
        
        await t.commit();
        const result = await Room.findByPk(room.id, { include: ["images"] });
        res.status(201).send(result);
    } catch (err) {
        await t.rollback();
        res.status(500).send({ message: err.message });
    }
};

// --- UPDATE ---
exports.update = async (req, res) => {
    const id = req.params.id;
    const { type, pricePerNight, description, amenities, imagesToDelete } = req.body;
    const t = await db.sequelize.transaction();
    try {
        await Room.update({ type, pricePerNight, description, amenities: JSON.parse(amenities) }, { where: { id: id }, transaction: t });

        // Ajouter les nouvelles images si elles existent
        if (req.cloudinaryUrls && req.cloudinaryUrls.length > 0) {
            const imageRecords = req.cloudinaryUrls.map(url => ({ url: url, roomId: id }));
            await RoomImage.bulkCreate(imageRecords, { transaction: t });
        }
        
        await t.commit();
        const updatedRoom = await Room.findByPk(id, { include: ["images"] });
        res.send(updatedRoom);
    } catch (err) {
        await t.rollback();
        res.status(500).send({ message: "Erreur lors de la mise à jour de la chambre." });
    }
};

// --- FIND ALL (PAGINATED) ---
exports.findAll = (req, res) => {
    const { page = 1, size = 8, minPrice, maxPrice, type } = req.query;
    const limit = parseInt(size);
    const offset = (page - 1) * limit;
    let condition = {};
    if (type) condition.type = { [Op.like]: `%${type}%` };
    if (minPrice && maxPrice) condition.pricePerNight = { [Op.between]: [minPrice, maxPrice] };
    else if (minPrice) condition.pricePerNight = { [Op.gte]: minPrice };
    else if (maxPrice) condition.pricePerNight = { [Op.lte]: maxPrice };

    Room.findAndCountAll({ where: condition, limit, offset, include: ["images"], distinct: true })
        .then(data => {
            res.send({
                totalPages: Math.ceil(data.count / limit),
                currentPage: parseInt(page),
                totalItems: data.count,
                rooms: data.rows
            });
        })
        .catch(err => res.status(500).send({ message: err.message }));
};

// --- FIND ONE ---
exports.findOne = (req, res) => {
    Room.findByPk(req.params.id, { include: ["images"] })
        .then(data => {
            if (data) res.send(data);
            else res.status(404).send({ message: "Chambre non trouvée."});
        })
        .catch(err => res.status(500).send({ message: err.message }));
};

// --- DELETE ROOM ---
exports.delete = (req, res) => {
    const id = req.params.id;
    Room.destroy({ where: { id: id }})
        .then(num => {
            if (num == 1) res.send({ message: "Chambre supprimée avec succès !" });
            else res.status(404).send({ message: `Impossible de supprimer la chambre id=${id}.` });
        })
        .catch(err => res.status(500).send({ message: `Erreur lors de la suppression.`}));
};

// --- FIND ALL TYPES ---
exports.findAllTypes = async (req, res) => {
    try {
        const types = await Room.findAll({
            attributes: [[db.Sequelize.fn('DISTINCT', db.Sequelize.col('type')), 'type']],
            order: [['type', 'ASC']]
        });
        const typeStrings = types.map(t => t.type);
        res.send(typeStrings);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// --- DELETE IMAGE ---
exports.deleteImage = async (req, res) => {
    const { imageId } = req.params;
    try {
        const image = await RoomImage.findByPk(imageId);
        if (!image) {
            return res.status(404).send({ message: "Image non trouvée." });
        }

        // Extraire le public_id de l'URL Cloudinary
        // ex: https://res.cloudinary.com/cloud_name/image/upload/folder/public_id.jpg -> folder/public_id
        const publicId = image.url.split('/').slice(-2).join('/').split('.')[0];

        // Supprimer l'image de Cloudinary
        await cloudinary.uploader.destroy(publicId);

        // Supprimer l'image de la base de données
        await image.destroy();
        
        res.send({ message: "Image supprimée avec succès." });
    } catch (error) {
        console.error("Erreur de suppression d'image:", error);
        res.status(500).send({ message: "Erreur lors de la suppression de l'image." });
    }
};