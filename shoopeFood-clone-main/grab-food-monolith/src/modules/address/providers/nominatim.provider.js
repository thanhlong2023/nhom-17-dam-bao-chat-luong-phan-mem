const normalizeAddress = require("../utils/normalize-address");

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

const getHeaders = () => ({
  Accept: "application/json",
  "Accept-Language": "vi,en;q=0.8",
  "User-Agent":
    process.env.NOMINATIM_USER_AGENT ||
    "GrabFoodClone/1.0 (configure NOMINATIM_USER_AGENT with a contact email)",
});

const requestJson = async (url) => {
  const response = await fetch(url, { headers: getHeaders() });
  if (!response.ok) {
    const error = new Error(`Nominatim request failed with HTTP ${response.status}`);
    error.code = "NOMINATIM_REQUEST_FAILED";
    throw error;
  }
  return response.json();
};

const toNullableNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const toPlaceId = (item) =>
  `osm:${item.osm_type || "place"}:${item.osm_id || item.place_id}:${item.lat}:${item.lon}`;

const parsePlaceId = (placeId) => {
  const parts = String(placeId || "").split(":");
  if (parts.length < 6 || parts[0] !== "osm") {
    return null;
  }

  const latitude = Number(parts[parts.length - 2]);
  const longitude = Number(parts[parts.length - 1]);
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    ? { latitude, longitude }
    : null;
};

const addressParts = (item) => {
  const address = item.address || {};
  const formattedAddress = item.display_name || "";
  const normalized = normalizeAddress({ ...address, formattedAddress });

  return {
    province: address.state || address.city || address.province || normalized.province,
    district:
      address.city_district ||
      address.district ||
      address.county ||
      address.town ||
      normalized.district,
    ward:
      address.suburb ||
      address.quarter ||
      address.neighbourhood ||
      address.village ||
      normalized.ward,
    street:
      address.road ||
      address.pedestrian ||
      address.residential ||
      address.hamlet ||
      normalized.street,
    houseNumber: address.house_number || normalized.houseNumber,
  };
};

const toSuggestion = (item) => {
  const description = item.display_name || "";
  const [mainText = "", ...secondaryParts] = description.split(",").map((part) => part.trim());
  return {
    placeId: toPlaceId(item),
    description,
    mainText,
    secondaryText: secondaryParts.join(", "),
    latitude: toNullableNumber(item.lat),
    longitude: toNullableNumber(item.lon),
    provider: "nominatim",
    raw: item,
  };
};

const toDetail = (item) => ({
  placeId: toPlaceId(item),
  formattedAddress: item.display_name || "",
  latitude: toNullableNumber(item.lat),
  longitude: toNullableNumber(item.lon),
  ...addressParts(item),
  provider: "nominatim",
  raw: item,
});

const suggest = async (query) => {
  const url = new URL(`${NOMINATIM_BASE_URL}/search`);
  url.searchParams.set("q", String(query || "").trim());
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "vn");
  url.searchParams.set("limit", "8");

  const payload = await requestJson(url);
  return Array.isArray(payload) ? payload.map(toSuggestion) : [];
};

const reverse = async (latitude, longitude) => {
  const url = new URL(`${NOMINATIM_BASE_URL}/reverse`);
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");

  const payload = await requestJson(url);
  return payload?.display_name ? toDetail(payload) : null;
};

const getDetail = async (placeId) => {
  const coordinates = parsePlaceId(placeId);
  return coordinates ? reverse(coordinates.latitude, coordinates.longitude) : null;
};

module.exports = {
  name: "nominatim",
  suggest,
  getDetail,
  reverse,
};
