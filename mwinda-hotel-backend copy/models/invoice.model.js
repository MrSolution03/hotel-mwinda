module.exports = (sequelize, Sequelize) => {
    const Invoice = sequelize.define("invoices", {
        invoiceNumber: { type: Sequelize.STRING, unique: true },
        issueDate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        pdfPath: { type: Sequelize.STRING }
    });
    return Invoice;
};