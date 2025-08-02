const db = require("../models");
const { Op } = require("sequelize");
const Payment = db.payments;
const Booking = db.bookings;
const Room = db.rooms;
const User = db.users;

exports.getAdminStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // 1. Revenus totaux (basés sur les paiements réussis)
        const totalRevenue = await Payment.sum('amount', {
            where: { status: 'réussi' }
        });

        // 2. Revenus du mois en cours
        const monthlyRevenue = await Payment.sum('amount', {
            where: {
                status: 'réussi',
                paymentDate: { [Op.gte]: startOfMonth }
            }
        });

        // 3. Nombre total de réservations confirmées
        const totalConfirmedBookings = await Booking.count({
            where: { status: 'confirmée' }
        });

        // 4. Taux d'occupation actuel
        const totalRooms = await Room.count();
        const currentlyOccupiedRooms = await Booking.count({
            where: {
                status: 'confirmée',
                arrivalDate: { [Op.lte]: new Date() },
                departureDate: { [Op.gt]: new Date() }
            },
            distinct: true,
            col: 'roomId'
        });
        const occupancyRate = totalRooms > 0 ? (currentlyOccupiedRooms / totalRooms) * 100 : 0;

        // 5. Nouveaux clients aujourd'hui
        const newClientsToday = await User.count({
            where: {
                role: 'client',
                createdAt: { [Op.gte]: startOfToday }
            }
        });

        res.status(200).send({
            totalRevenue: totalRevenue || 0,
            monthlyRevenue: monthlyRevenue || 0,
            totalConfirmedBookings: totalConfirmedBookings || 0,
            occupancyRate: parseFloat(occupancyRate.toFixed(2)),
            currentlyOccupiedRooms: currentlyOccupiedRooms,
            totalRooms: totalRooms,
            newClientsToday: newClientsToday
        });

    } catch (err) {
        res.status(500).send({ message: err.message || "Une erreur est survenue lors de la récupération des statistiques." });
    }
};