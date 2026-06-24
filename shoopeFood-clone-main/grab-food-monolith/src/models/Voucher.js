const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Voucher = sequelize.define(
  "Voucher",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    discountType: {
      type: DataTypes.STRING, // "FIXED" or "PERCENTAGE"
      allowNull: false,
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    minOrderValue: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    maxDiscountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    usedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "vouchers",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Voucher;
