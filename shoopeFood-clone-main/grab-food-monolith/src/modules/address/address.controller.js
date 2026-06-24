const addressService = require("./address.service");
const { UserAddress } = require("../../models");

const sendError = (res, error) => {
  console.warn(`[address] Unexpected controller error: ${error.message}`);
  return res.status(500).json({ message: "Unable to resolve address" });
};

const suggest = async (req, res) => {
  try {
    const data = await addressService.suggestAddresses(req.query.q);
    return res.json(data);
  } catch (error) {
    return sendError(res, error);
  }
};

const detail = async (req, res) => {
  try {
    const data = await addressService.getAddressDetail(req.params.placeId, req.query);
    return res.json(data);
  } catch (error) {
    return sendError(res, error);
  }
};

const reverse = async (req, res) => {
  try {
    const data = await addressService.reverseAddress(req.query.lat, req.query.lng);
    return res.json(data);
  } catch (error) {
    return sendError(res, error);
  }
};

const normalizeSavedAddress = (item) => ({
  id: Number(item.id),
  userId: Number(item.userId),
  label: item.label || "",
  placeId: item.placeId || null,
  formattedAddress: item.formattedAddress,
  latitude: Number(item.latitude),
  longitude: Number(item.longitude),
  province: item.province || "",
  district: item.district || "",
  ward: item.ward || "",
  street: item.street || "",
  houseNumber: item.houseNumber || "",
  note: item.note || "",
  provider: item.provider,
  createdAt: item.createdAt,
});

const validateSavedAddress = (body) => {
  const formattedAddress = String(body.formattedAddress || "").trim();
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);

  if (!formattedAddress) {
    return { error: "formattedAddress is required" };
  }
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return { error: "latitude is invalid" };
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return { error: "longitude is invalid" };
  }

  return {
    value: {
      label: String(body.label || "").trim().slice(0, 50) || null,
      placeId: body.placeId ? String(body.placeId).trim() : null,
      formattedAddress,
      latitude,
      longitude,
      province: String(body.province || "").trim() || null,
      district: String(body.district || "").trim() || null,
      ward: String(body.ward || "").trim() || null,
      street: String(body.street || "").trim() || null,
      houseNumber: String(body.houseNumber || "").trim() || null,
      note: String(body.note || "").trim() || null,
      provider: String(body.provider || "manual").trim().slice(0, 30),
    },
  };
};

const listMine = async (req, res) => {
  try {
    const items = await UserAddress.findAll({
      where: { userId: req.user.id },
      order: [["id", "DESC"]],
    });
    return res.json({ data: items.map(normalizeSavedAddress) });
  } catch (error) {
    return sendError(res, error);
  }
};

const createMine = async (req, res) => {
  try {
    const validation = validateSavedAddress(req.body);
    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }

    const item = await UserAddress.create({
      userId: req.user.id,
      ...validation.value,
    });
    return res.status(201).json({ message: "Address saved", data: normalizeSavedAddress(item) });
  } catch (error) {
    return sendError(res, error);
  }
};

const updateMine = async (req, res) => {
  try {
    const item = await UserAddress.findOne({
      where: { id: Number(req.params.id), userId: req.user.id },
    });
    if (!item) {
      return res.status(404).json({ message: "Address not found" });
    }

    const validation = validateSavedAddress(req.body);
    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }

    await item.update(validation.value);
    return res.json({ message: "Address updated", data: normalizeSavedAddress(item) });
  } catch (error) {
    return sendError(res, error);
  }
};

const deleteMine = async (req, res) => {
  try {
    const item = await UserAddress.findOne({
      where: { id: Number(req.params.id), userId: req.user.id },
    });
    if (!item) {
      return res.status(404).json({ message: "Address not found" });
    }

    await item.destroy();
    return res.json({ message: "Address deleted", data: normalizeSavedAddress(item) });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  suggest,
  detail,
  reverse,
  listMine,
  createMine,
  updateMine,
  deleteMine,
};
