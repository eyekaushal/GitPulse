const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  githubData: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'github_data'
  },
  aggregatedData: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'aggregated_data'
  },
  insights: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  fetchedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'fetched_at'
  }
}, {
  tableName: 'profiles',
  underscored: true
});

module.exports = Profile;