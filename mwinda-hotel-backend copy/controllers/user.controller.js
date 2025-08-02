const db = require("../models");
const User = db.users;
const { Op } = require("sequelize");


exports.findAllUsers = (req, res) => {
    User.findAll({ attributes: { exclude: ['password'] } })
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

// Obtenir le profil de l'utilisateur actuellement connecté
exports.getUserProfile = (req, res) => {
    const userId = req.userId;

    User.findByPk(userId, {
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] }
    })
    .then(user => {
        if (!user) {
            return res.status(404).send({ message: "Utilisateur non trouvé." });
        }
        res.status(200).send(user);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Mettre à jour le profil de l'utilisateur actuellement connecté
exports.updateUser = async (req, res) => {
    const id = req.params.id;
    try {
        // Règle 1: Si on essaie de promouvoir un utilisateur en admin
        if (req.body.role === 'admin') {
            const adminCount = await User.count({ where: { role: 'admin' } });
            // On vérifie si l'utilisateur qu'on modifie n'est pas déjà un admin
            const targetUser = await User.findByPk(id);
            if (targetUser.role !== 'admin' && adminCount >= 3) {
                return res.status(403).send({ message: "Limite de 3 administrateurs atteinte. Impossible d'en ajouter un nouveau." });
            }
        }
        
        const [num] = await User.update(req.body, { where: { id: id } });
        if (num === 1) {
            res.send({ message: "Utilisateur mis à jour." });
        } else {
            res.status(404).send({ message: `Utilisateur non trouvé.` });
        }
    } catch (err) {
        res.status(500).send({ message: "Erreur lors de la mise à jour." });
    }
};

exports.deleteUser = async (req, res) => {
    const id = req.params.id;
    try {
        const userToDelete = await User.findByPk(id);
        if (!userToDelete) {
            return res.status(404).send({ message: "Utilisateur non trouvé." });
        }
        
        // Règle 2: Interdire la suppression d'un administrateur
        if (userToDelete.role === 'admin') {
            return res.status(403).send({ message: "Action non autorisée : impossible de supprimer un administrateur." });
        }

        await User.destroy({ where: { id: id } });
        res.send({ message: "Utilisateur supprimé." });
    } catch (err) {
        res.status(500).send({ message: "Erreur lors de la suppression." });
    }
};

exports.updateUserProfile = (req, res) => { // <-- L'export était peut-être manquant ou malformé
    const userId = req.userId;
    const { fullName, phoneNumber, address } = req.body;

    User.update({
        fullName,
        phoneNumber,
        address
    }, {
        where: { id: userId }
    })
    .then(num => {
        if (num == 1) {
            res.send({ message: "Profil mis à jour avec succès." });
        } else {
            res.status(400).send({ message: "Impossible de mettre à jour le profil. Utilisateur non trouvé ou données inchangées." });
        }
    })
    .catch(err => {
        res.status(500).send({ message: "Erreur lors de la mise à jour du profil." });
    });
};