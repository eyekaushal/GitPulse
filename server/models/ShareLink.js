const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShareLink = sequelize.define('ShareLink', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  slug: {
    type: DataTypes.STRING(12),
    allowNull: false,
    unique: true
  },
  shareType: {
    type: DataTypes.ENUM('profile', 'compare'),
    allowNull: false,
    field: 'share_type'
  },
  usernames: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false
  },
  snapshotData: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'snapshot_data'
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'view_count'
  }
}, {
  tableName: 'share_links',
  underscored: true
});

module.exports = ShareLink;