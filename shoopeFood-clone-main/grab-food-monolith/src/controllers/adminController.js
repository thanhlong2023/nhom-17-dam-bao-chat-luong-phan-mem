const { Voucher, SystemSetting } = require("../models");

// ========================
// VOUCHER MANAGEMENT
// ========================

exports.getVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.findAll({
      order: [["created_at", "DESC"]],
    });
    return res.json({ data: vouchers });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }
    return res.json({ data: voucher });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createVoucher = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      validFrom,
      validUntil,
      usageLimit,
      isActive,
    } = req.body;

    if (!code || !discountType || discountValue === undefined || !validFrom || !validUntil) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existed = await Voucher.findOne({ where: { code } });
    if (existed) {
      return res.status(400).json({ message: "Voucher code already exists" });
    }

    const voucher = await Voucher.create({
      code,
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscountAmount,
      validFrom,
      validUntil,
      usageLimit,
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({ message: "Voucher created", data: voucher });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateVoucher = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      validFrom,
      validUntil,
      usageLimit,
      isActive,
    } = req.body;

    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    if (code && code !== voucher.code) {
      const existed = await Voucher.findOne({ where: { code } });
      if (existed) {
        return res.status(400).json({ message: "Voucher code already exists" });
      }
    }

    await voucher.update({
      code: code !== undefined ? code : voucher.code,
      discountType: discountType !== undefined ? discountType : voucher.discountType,
      discountValue: discountValue !== undefined ? discountValue : voucher.discountValue,
      minOrderValue: minOrderValue !== undefined ? minOrderValue : voucher.minOrderValue,
      maxDiscountAmount: maxDiscountAmount !== undefined ? maxDiscountAmount : voucher.maxDiscountAmount,
      validFrom: validFrom !== undefined ? validFrom : voucher.validFrom,
      validUntil: validUntil !== undefined ? validUntil : voucher.validUntil,
      usageLimit: usageLimit !== undefined ? usageLimit : voucher.usageLimit,
      isActive: isActive !== undefined ? isActive : voucher.isActive,
    });

    return res.json({ message: "Voucher updated", data: voucher });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteVoucher = async (req, res) => {
  try {
    const id = req.params.id;
    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    await voucher.destroy();
    return res.json({ message: "Voucher deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ========================
// SYSTEM SETTINGS MANAGEMENT
// ========================

exports.getSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.findAll({
      order: [["key", "ASC"]],
    });
    return res.json({ data: settings });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createSetting = async (req, res) => {
  try {
    const { key, value, description } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ message: "Key and value are required" });
    }

    const existed = await SystemSetting.findOne({ where: { key } });
    if (existed) {
      return res.status(400).json({ message: "Setting key already exists" });
    }

    const setting = await SystemSetting.create({ key, value, description });
    return res.status(201).json({ message: "Setting created", data: setting });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const id = req.params.id;
    const { key, value, description } = req.body;

    const setting = await SystemSetting.findByPk(id);
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }

    if (key && key !== setting.key) {
      const existed = await SystemSetting.findOne({ where: { key } });
      if (existed) {
        return res.status(400).json({ message: "Setting key already exists" });
      }
    }

    await setting.update({
      key: key !== undefined ? key : setting.key,
      value: value !== undefined ? value : setting.value,
      description: description !== undefined ? description : setting.description,
    });

    return res.json({ message: "Setting updated", data: setting });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteSetting = async (req, res) => {
  try {
    const id = req.params.id;
    const setting = await SystemSetting.findByPk(id);
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }

    await setting.destroy();
    return res.json({ message: "Setting deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
