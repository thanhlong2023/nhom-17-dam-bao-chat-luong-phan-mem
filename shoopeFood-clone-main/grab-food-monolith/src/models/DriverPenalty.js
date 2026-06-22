const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DriverPenalty = sequelize.define(
  "DriverPenalty",
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    driverId: { type: DataTypes.INTEGER, allowNull: false, field: "driver_id" },
    type: { type: DataTypes.STRING(30), allowNull: false },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "ACTIVE" },
    reason: { type: DataTypes.TEXT, allowNull: true },
    startsAt: { type: DataTypes.DATE, allowNull: false, field: "starts_at", defaultValue: DataTypes.NOW },
    endsAt: { type: DataTypes.DATE, allowNull: true, field: "ends_at" },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
    updatedAt: { type: DataTypes.DATE, field: "updated_at" },
  },
  {
    tableName: "driver_penalties",
    timestamps: true,
    indexes: [
      { name: "idx_driver_penalties_driver_status", fields: ["driver_id", "status"] },
      { name: "idx_driver_penalties_ends_at", fields: ["ends_at"] },
    ],
  }
);

module.exports = DriverPenalty;
