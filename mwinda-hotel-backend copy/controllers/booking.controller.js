const db = require("../models");
const { Op } = require("sequelize");
const Booking = db.bookings;
const Room = db.rooms;
const Payment = db.payments;
const Invoice = db.invoices;
const User = db.users;


// Client: Créer une nouvelle réservation
exports.createBooking = async (req, res) => {
    const { roomId, arrivalDate, departureDate } = req.body;
    const userId = req.userId; // Vient du middleware verifyToken

    if (!roomId || !arrivalDate || !departureDate) {
        return res.status(400).send({ message: "Tous les champs sont requis." });
    }

    try {
        // 1. Vérifier si la chambre existe et est disponible
        const room = await Room.findByPk(roomId);
        if (!room) return res.status(404).send({ message: "Chambre non trouvée." });
        if (room.status !== 'disponible') return res.status(400).send({ message: "Cette chambre n'est pas disponible." });

        // 2. Vérifier si la chambre est déjà réservée pour ces dates
        const existingBooking = await Booking.findOne({
            where: {
                roomId: roomId,
                status: 'confirmée',
                [Op.or]: [
                    { arrivalDate: { [Op.between]: [arrivalDate, departureDate] } },
                    { departureDate: { [Op.between]: [arrivalDate, departureDate] } },
                    { [Op.and]: [{ arrivalDate: { [Op.lte]: arrivalDate } }, { departureDate: { [Op.gte]: departureDate } }] }
                ]
            }
        });
        if (existingBooking) return res.status(409).send({ message: "La chambre est déjà réservée pour ces dates." });

        // 3. Calculer le prix total
        const start = new Date(arrivalDate);
        const end = new Date(departureDate);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if(nights <= 0) return res.status(400).send({ message: "La date de départ doit être après la date d'arrivée." });

        const totalPrice = nights * room.pricePerNight;

        // 4. Créer la réservation
        const booking = await Booking.create({
            roomId,
            userId,
            arrivalDate,
            departureDate,
            totalPrice,
            status: 'en attente'
        });

        res.status(201).send(booking);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.downloadInvoice = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.userId;

        const user = await db.users.findByPk(userId); // ✅ version corrigée

        const whereClause = { bookingId: bookingId };

        // Si l'utilisateur n'est pas un admin, il ne peut accéder qu'à ses propres réservations
        if (user.role !== 'admin') {
            whereClause['$booking.userId$'] = userId;
        }

        const invoice = await Invoice.findOne({
            where: whereClause,
            include: {
                model: db.bookings,
                as: 'booking',
                attributes: []
            }
        });

        if (!invoice) {
            return res.status(404).send({ message: "Facture non trouvée ou accès non autorisé." });
        }

        const path = require('path'); // ✅ au cas où ce n'est pas déjà importé
        const filePath = path.join(__dirname, '..', invoice.pdfPath);

        res.download(filePath, `facture-${invoice.invoiceNumber}.pdf`, (err) => {
            if (err) {
                console.error("Erreur lors du téléchargement du fichier:", err);
                res.status(500).send({ message: "Impossible de télécharger le fichier." });
            }
        });

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};


// Client: Voir ses propres réservations
exports.findUserBookings = (req, res) => {
    Booking.findAll({ 
        where: { userId: req.userId },
        include: [{ model: Room, as: 'room', include: ['images'] }, { model: Payment, as: 'payment' }, { model: Invoice, as: 'invoice' }]
    })
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};

// Admin: Voir toutes les réservations
exports.findAllBookings = (req, res) => {
    Booking.findAll({ 
        include: [{ model: Room, as: 'room' }, { model: db.users, as: 'user' }]
    })
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};

// Admin: Changer le statut d'une réservation
exports.updateBookingStatus = (req, res) => {
    const { status } = req.body;
    if (!['confirmée', 'annulée'].includes(status)) {
        return res.status(400).send({ message: "Statut non valide." });
    }
    Booking.update({ status }, { where: { id: req.params.id } })
        .then(num => {
            if (num == 1) res.send({ message: "Statut de la réservation mis à jour." });
            else res.status(404).send({ message: "Réservation non trouvée." });
        })
        .catch(err => res.status(500).send({ message: err.message }));
};