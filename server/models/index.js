const sequelize = require('../config/database');
const Profile = require('./Profile');
const ShareLink = require('./ShareLink');

module.exports = { sequelize, Profile, ShareLink };