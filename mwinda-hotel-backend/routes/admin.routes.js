// routes/admin.routes.js

const { authJwt } = require("../middleware");
const controller = require("../controllers/admin.controller");

module.exports = function(app) {
    app.use((req, res, next) => {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    const adminOnly = [authJwt.verifyToken, authJwt.isAdmin];

    // Routes pour les Utilisateurs
    app.get("/api/admin/users", adminOnly, controller.findAllUsers);
    app.put("/api/admin/users/:id", adminOnly, controller.updateUser);
    app.delete("/api/admin/users/:id", adminOnly, controller.deleteUser);
    
    // --- LA ROUTE MANQUANTE EST AJOUTÉE ICI ---
    app.put("/api/admin/users/:id/reset-password", adminOnly, controller.adminResetPassword);

    // Routes pour les Finances
    app.get("/api/admin/payments", adminOnly, controller.findAllPayments);
    app.get("/api/admin/invoices", adminOnly, controller.findAllInvoices);
    app.delete("/api/admin/invoices/:id", adminOnly, controller.deleteInvoice);
};