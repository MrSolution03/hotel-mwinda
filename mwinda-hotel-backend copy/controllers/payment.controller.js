const db = require("../models");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const transporter = require("../config/mail.config");

const Booking = db.bookings;
const Payment = db.payments;
const Invoice = db.invoices;
const User = db.users;
const Room = db.rooms;

// Fonction principale pour simuler un paiement et confirmer une réservation
exports.simulatePayment = async (req, res) => {
    const { bookingId, method } = req.body;
    const userId = req.userId; // Fourni par le middleware JWT

    // 1. Validation de la requête
    if (!bookingId || !method) {
        return res.status(400).send({ message: "L'ID de la réservation et la méthode de paiement sont requis." });
    }
    if (!['Airtel Money', 'M-Pesa'].includes(method)) {
        return res.status(400).send({ message: "Méthode de paiement non supportée. Utilisez 'Airtel Money' ou 'M-Pesa'." });
    }

    // Début de la transaction pour assurer que toutes les opérations réussissent ou échouent ensemble
    const t = await db.sequelize.transaction();

    try {
        // 2. Récupérer la réservation et les informations associées (Client, Chambre)
        const booking = await Booking.findOne({
            where: {
                id: bookingId,
                userId: userId // S'assurer que le client ne paie que pour sa propre réservation
            },
            include: [
                { model: User, as: 'user' },
                { model: Room, as: 'room' }
            ],
            transaction: t
        });

        if (!booking) {
            await t.rollback();
            return res.status(404).send({ message: "Réservation non trouvée ou n'appartenant pas à cet utilisateur." });
        }

        if (booking.status !== 'en attente') {
            await t.rollback();
            return res.status(409).send({ message: `Cette réservation ne peut plus être payée (statut actuel: ${booking.status}).` });
        }

        // 3. Créer l'enregistrement du paiement
        const payment = await Payment.create({
            bookingId: booking.id,
            amount: booking.totalPrice,
            method: method,
            transactionId: `SIM_${method.replace(/\s+/g, '')}_${Date.now()}`,
            status: 'réussi',
            paymentDate: new Date()
        }, { transaction: t });

        // 4. Mettre à jour le statut de la réservation à 'confirmée'
        await booking.update({ status: 'confirmée' }, { transaction: t });

        // 5. Générer la facture PDF
        const invoiceNumber = `INV-${booking.id}-${new Date().getFullYear()}`;
        const invoicesDir = path.join(__dirname, '..', 'invoices');
        const pdfPath = path.join(invoicesDir, `invoice-${booking.id}.pdf`);

        // Créer le dossier 'invoices' s'il n'existe pas
        if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir, { recursive: true });
        }

        // Création du document PDF
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        doc.pipe(fs.createWriteStream(pdfPath));

        // En-tête
        doc.fontSize(20).font('Helvetica-Bold').text('Mwinda Hotel', { align: 'center' });
        doc.fontSize(10).text('Kolwezi, République Démocratique du Congo', { align: 'center' });
        doc.moveDown(2);

        // Informations sur la facture
        doc.fontSize(16).font('Helvetica-Bold').text('FACTURE');
        doc.font('Helvetica').text(`Numéro de facture: ${invoiceNumber}`);
        doc.text(`Date d'émission: ${new Date().toLocaleDateString('fr-FR')}`);
        doc.moveDown();
        doc.text('Facturé à:');
        doc.font('Helvetica-Bold').text(booking.user.fullName);
        doc.font('Helvetica').text(booking.user.email);
        doc.text(booking.user.address || 'Adresse non fournie');
        doc.moveDown(2);

        // Tableau des détails
        doc.font('Helvetica-Bold').text('Description', 50, doc.y);
        doc.text('Total', 450, doc.y, { align: 'right' });
        doc.y += 15;
        doc.lineCap('butt').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.y += 10;
        
        const bookingDetails = `Réservation de la chambre '${booking.room.type}' du ${new Date(booking.arrivalDate).toLocaleDateString('fr-FR')} au ${new Date(booking.departureDate).toLocaleDateString('fr-FR')}`;
        doc.font('Helvetica').text(bookingDetails, 50, doc.y, { width: 400 });
        doc.text(`${booking.totalPrice} USD`, 450, doc.y, { align: 'right' });
        doc.y += 30;
        doc.lineCap('butt').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.y += 10;
        
        // Total
        doc.font('Helvetica-Bold').fontSize(14).text('Montant Total Payé:', 300, doc.y);
        doc.text(`${booking.totalPrice} USD`, 450, doc.y, { align: 'right' });
        
        // Finaliser le PDF
        doc.end();

        // 6. Créer l'enregistrement de la facture dans la base de données
        await Invoice.create({
            bookingId: booking.id,
            invoiceNumber: invoiceNumber,
            pdfPath: `invoices/invoice-${booking.id}.pdf` // Chemin relatif pour un accès facile via l'API
        }, { transaction: t });

        // Si tout s'est bien passé, on valide la transaction
        await t.commit();

        // 7. Envoyer l'email de confirmation (en dehors de la transaction)
        try {
            await transporter.sendMail({
                from: `"Mwinda Hotel" <${process.env.MAIL_USER}>`,
                to: booking.user.email,
                subject: `Confirmation de votre réservation chez Mwinda Hotel (N° ${booking.id})`,
                html: `<h3>Bonjour ${booking.user.fullName},</h3>
                       <p>Nous avons le plaisir de vous confirmer votre réservation chez Mwinda Hotel.</p>
                       <p><b>Détails de la réservation :</b></p>
                       <ul>
                           <li><b>Chambre :</b> ${booking.room.type}</li>
                           <li><b>Date d'arrivée :</b> ${new Date(booking.arrivalDate).toLocaleDateString('fr-FR')}</li>
                           <li><b>Date de départ :</b> ${new Date(booking.departureDate).toLocaleDateString('fr-FR')}</li>
                           <li><b>Montant payé :</b> ${booking.totalPrice} USD via ${method}</li>
                       </ul>
                       <p>Votre facture est en cours de traitement et sera disponible dans votre espace client. Nous vous remercions de votre confiance et nous réjouissons de vous accueillir.</p>
                       <p>Cordialement,<br>L'équipe de Mwinda Hotel</p>`
            });
        } catch (emailError) {
            console.error("CRITICAL: L'envoi de l'email de confirmation a échoué après un paiement réussi.", emailError);
            // On ne bloque pas la réponse de l'utilisateur pour une erreur d'email, mais on la logue.
        }

        // 8. Envoyer la réponse de succès
        res.status(200).send({
            message: "Paiement réussi, réservation confirmée et facture générée.",
            paymentDetails: payment
        });

    } catch (err) {
        // En cas d'erreur à n'importe quelle étape, on annule toutes les opérations
        await t.rollback();
        console.error("Erreur lors du processus de paiement:", err);
        res.status(500).send({ message: err.message || "Une erreur est survenue lors du traitement de votre paiement." });
    }
};