// controllers/admin.controller.js
const fs = require('fs');
const path = require('path');
const db = require("../models");
const bcrypt = require('bcryptjs');
const User = db.users;
const Payment = db.payments;
const Invoice = db.invoices;
const Booking = db.bookings;

// --- Gestion des Utilisateurs ---


const getPagination = (page, size) => {
    const limit = size ? +size : 5; // 5 éléments par défaut
    const offset = page ? (page - 1) * limit : 0;
    return { limit, offset };
};

const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows } = data;
    const currentPage = page ? +page : 1;
    const totalPages = Math.ceil(totalItems / limit);
    return { totalItems, data: rows, totalPages, currentPage };
};

// --- Gestion des Utilisateurs ---
exports.findAllUsers = (req, res) => {
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);

    User.findAndCountAll({ where: null, limit, offset, attributes: { exclude: ['password'] } })
        .then(data => {
            const response = getPagingData(data, page, limit);
            res.send(response);
        })
        .catch(err => res.status(500).send({ message: err.message }));
};

exports.updateUser = (req, res) => {
    const id = req.params.id;
    // L'admin ne peut modifier que ces champs
    const { fullName, email, phoneNumber, address } = req.body;

    User.update({ fullName, email, phoneNumber, address }, { where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Utilisateur mis à jour." });
            else res.status(404).send({ message: `Utilisateur non trouvé ou données inchangées.` });
        })
        .catch(err => res.status(500).send({ message: "Erreur lors de la mise à jour."}));
};

exports.deleteUser = (req, res) => {
    const id = req.params.id;
    User.destroy({ where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Utilisateur supprimé." });
            else res.status(404).send({ message: `Utilisateur non trouvé.` });
        })
        .catch(err => res.status(500).send({ message: "Erreur lors de la suppression."}));
};

exports.adminResetPassword = async (req, res) => {
    const adminRequestingId = req.userId; // ID de l'admin qui fait la requête
    const targetUserId = req.params.id; // ID de l'utilisateur à modifier
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).send({ message: "Le nouveau mot de passe doit contenir au moins 6 caractères." });
    }

    try {
        const targetUser = await User.findByPk(targetUserId);
        if (!targetUser) {
            return res.status(404).send({ message: "Utilisateur non trouvé." });
        }

        // Règle de sécurité : Un admin ne peut pas changer le mot de passe d'un autre admin
        // (sauf s'il change son propre mot de passe, ce qui est autorisé)
        if (targetUser.role === 'admin' && targetUser.id != adminRequestingId) {
             return res.status(403).send({ message: "Action non autorisée : vous ne pouvez pas changer le mot de passe d'un autre administrateur." });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 8);
        await User.update({ password: hashedPassword }, { where: { id: targetUserId } });

        res.send({ message: "Le mot de passe de l'utilisateur a été réinitialisé avec succès." });

    } catch (err) {
        console.error("ERREUR 500 dans adminResetPassword:", err); // Ajout d'un log pour le débogage
        res.status(500).send({ message: "Erreur interne du serveur lors de la réinitialisation du mot de passe." });
    }
};


// --- Gestion Financière ---

exports.findAllPayments = (req, res) => {
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);
    
    Payment.findAndCountAll({ 
        where: null, limit, offset,
        include: [{ model: Booking, as: 'booking', include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email'] }] }]
    })
    .then(data => {
        const response = getPagingData(data, page, limit);
        res.send(response);
    })
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.findAllInvoices = (req, res) => {
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);

    Invoice.findAndCountAll({
         where: null, limit, offset,
         include: [{ model: Booking, as: 'booking', include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email'] }] }]
    })
    .then(data => {
        const response = getPagingData(data, page, limit);
        res.send(response);
    })
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.deleteInvoice = async (req, res) => {
    const id = req.params.id;
    try {
        const invoice = await Invoice.findByPk(id);
        if (!invoice) return res.status(404).send({ message: 'Facture non trouvée.' });
        
        // Supprimer le fichier PDF physique
        const filePath = path.join(__dirname, '..', invoice.pdfPath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Supprimer l'enregistrement de la base de données
        await Invoice.destroy({ where: { id: id } });

        res.send({ message: "Facture supprimée avec succès." });
    } catch (err) {
        res.status(500).send({ message: "Erreur lors de la suppression de la facture."});
    }
};