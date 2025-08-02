// seed_admin.js

require('dotenv').config(); // <-- AJOUTER CETTE LIGNE TOUT EN HAUT

const db = require('./models');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    await db.sequelize.sync();

    const adminEmail = 'admin@mwinda.com';
    const adminExists = await db.users.findOne({ where: { email: adminEmail } });

    if (!adminExists) {
      await db.users.create({
        fullName: 'Admin Mwinda',
        email: adminEmail,
        password: bcrypt.hashSync('secure_admin_password_123', 8),
        role: 'admin'
      });
      console.log('🎉 Administrateur créé avec succès !');
    } else {
      console.log('ℹ️ L\'administrateur existe déjà.');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
  } finally {
    await db.sequelize.close();
  }
};

createAdmin();