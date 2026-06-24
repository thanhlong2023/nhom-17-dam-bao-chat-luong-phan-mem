const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SystemSetting = sequelize.define(
  "SystemSetting",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "system_settings",
    timestamps: true,
    underscored: true,
  }
);

module.exports = SystemSetting;
