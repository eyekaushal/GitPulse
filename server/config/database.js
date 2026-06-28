const { Sequelize } = require('sequelize');

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: false,
    })
  : new Sequelize('gitpulse', 'your_local_username', 'your_local_password', {
      host: 'localhost',
      dialect: 'postgres',
      logging: false,
    });

module.exports = sequelize;
