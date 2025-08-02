const { authJwt } = require("../middleware");
const bookingController = require("../controllers/booking.controller");
const paymentController = require("../controllers/payment.controller");

module.exports = function(app) {
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
        next();
    });

    // Client: Créer une réservation
    app.post("/api/bookings", [authJwt.verifyToken], bookingController.createBooking);

    // Admin: Lister toutes les réservations
    app.get("/api/bookings/all", [authJwt.verifyToken, authJwt.isAdmin], bookingController.findAllBookings);

    // Admin: Mettre à jour le statut d'une réservation
    app.patch("/api/bookings/:id/status", [authJwt.verifyToken, authJwt.isAdmin], bookingController.updateBookingStatus);
    
    // Client: Simuler le paiement d'une réservation
    app.post("/api/bookings/pay", [authJwt.verifyToken], paymentController.simulatePayment);

    app.get(
    "/api/bookings/:bookingId/invoice",
    [authJwt.verifyToken],
    bookingController.downloadInvoice
);
};