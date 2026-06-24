const { Op } = require("sequelize");
const { Voucher } = require("../models");

exports.validateVoucher = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Voucher code is required" });
    }

    if (subtotal === undefined || subtotal === null) {
      return res.status(400).json({ message: "Subtotal is required to validate voucher" });
    }

    const orderSubtotal = Number(subtotal);

    const voucher = await Voucher.findOne({
      where: {
        code: String(code).toUpperCase().trim(),
        isActive: true,
      },
    });

    if (!voucher) {
      return res.status(404).json({ message: "Mã giảm giá không tồn tại hoặc đã bị khóa" });
    }

    const now = new Date();
    if (voucher.validFrom && now < new Date(voucher.validFrom)) {
      return res.status(400).json({ message: "Mã giảm giá chưa đến thời gian sử dụng" });
    }

    if (voucher.validUntil && now > new Date(voucher.validUntil)) {
      return res.status(400).json({ message: "Mã giảm giá đã hết hạn" });
    }

    if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng" });
    }

    if (orderSubtotal < Number(voucher.minOrderValue)) {
      return res.status(400).json({ message: `Đơn hàng tối thiểu để dùng mã này là ${voucher.minOrderValue}đ` });
    }

    let discountAmount = 0;
    if (voucher.discountType === "PERCENTAGE") {
      discountAmount = (orderSubtotal * Number(voucher.discountValue)) / 100;
      if (voucher.maxDiscountAmount && discountAmount > Number(voucher.maxDiscountAmount)) {
        discountAmount = Number(voucher.maxDiscountAmount);
      }
    } else {
      // FIXED
      discountAmount = Number(voucher.discountValue);
    }

    // Discount cannot exceed subtotal
    if (discountAmount > orderSubtotal) {
      discountAmount = orderSubtotal;
    }

    return res.status(200).json({
      data: {
        id: voucher.id,
        code: voucher.code,
        discountAmount,
        discountType: voucher.discountType,
        discountValue: Number(voucher.discountValue),
        minOrderValue: Number(voucher.minOrderValue),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
