const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DriverOffer = sequelize.define(
  "DriverOffer",
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.BIGINT, allowNull: false, field: "order_id" },
    driverId: { type: DataTypes.INTEGER, allowNull: false, field: "driver_id" },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "OFFERED" },
    algorithm: { type: DataTypes.STRING(50), allowNull: true },
    searchRadiusKm: { type: DataTypes.DOUBLE, allowNull: true, field: "search_radius_km" },
    distanceKm: { type: DataTypes.DOUBLE, allowNull: true, field: "distance_km" },
    pickupEtaMinutes: { type: DataTypes.DOUBLE, allowNull: true, field: "pickup_eta_minutes" },
    dispatchScore: { type: DataTypes.DOUBLE, allowNull: true, field: "dispatch_score" },
    offeredAt: { type: DataTypes.DATE, allowNull: false, field: "offered_at", defaultValue: DataTypes.NOW },
    respondedAt: { type: DataTypes.DATE, allowNull: true, field: "responded_at" },
    expiresAt: { type: DataTypes.DATE, allowNull: true, field: "expires_at" },
    responseReason: { type: DataTypes.TEXT, allowNull: true, field: "response_reason" },
    cancellationChargeable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: "cancellation_chargeable",
      defaultValue: false,
    },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
    updatedAt: { type: DataTypes.DATE, field: "updated_at" },
  },
  {
    tableName: "driver_offers",
    timestamps: true,
    indexes: [
      { name: "uniq_driver_offers_order_driver", unique: true, fields: ["order_id", "driver_id"] },
      { name: "idx_driver_offers_driver_status", fields: ["driver_id", "status"] },
      { name: "idx_driver_offers_offered_at", fields: ["offered_at"] },
    ],
  }
);

module.exports = DriverOffer;
