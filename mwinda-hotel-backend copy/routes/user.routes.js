// routes/user.routes.js

const { authJwt } = require("../middleware");
// La ligne ci-dessous importe TOUT ce qui est exporté par user.controller.js
const userController = require("../controllers/user.controller");
const bookingController = require("../controllers/booking.controller");


module.exports = function(app) {
    app.use((req, res, next) => {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get(
        "/api/user/profile",
        [authJwt.verifyToken],
        userController.getUserProfile // Doit exister
    );

    app.put(
        "/api/user/profile",
        [authJwt.verifyToken],
        userController.updateUserProfile // Doit exister
    );

    app.get(
        "/api/user/bookings",
        [authJwt.verifyToken],
        bookingController.findUserBookings // Doit exister
    );
};