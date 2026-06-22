const { Op } = require("sequelize");
const { DriverOffer, DriverPenalty, Review, User } = require("../models");

const OFFER_STATUS = {
  OFFERED: "OFFERED",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  IGNORED: "IGNORED",
  DRIVER_CANCELLED: "DRIVER_CANCELLED",
  COMPLETED: "COMPLETED",
};

const ACCEPTED_OFFER_STATUSES = [
  OFFER_STATUS.ACCEPTED,
  OFFER_STATUS.DRIVER_CANCELLED,
  OFFER_STATUS.COMPLETED,
];
const REJECTED_OFFER_STATUSES = [OFFER_STATUS.REJECTED, OFFER_STATUS.IGNORED];
const AR_WINDOW_SIZE = 100;
const CR_WINDOW_SIZE = 100;
const OFFER_TTL_SECONDS = 45;
const REJECTION_COOLDOWN_THRESHOLD = 3;
const REJECTION_COOLDOWN_MINUTES = 15;
const CR_SUSPENSION_THRESHOLD = 8;
const CR_SUSPENSION_HOURS = 24;
const REWARD_AR_THRESHOLD = 85;
const REWARD_CR_THRESHOLD = 3;
const REWARD_RATING_THRESHOLD = 4.7;
const MIN_RATING_THRESHOLD = 4.3;

const percent = (numerator, denominator, fallback = 0) => {
  if (!denominator) {
    return fallback;
  }
  return Number(((numerator / denominator) * 100).toFixed(1));
};

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60 * 1000);
const addHours = (date, hours) => new Date(date.getTime() + hours * 60 * 60 * 1000);

const normalizeOfferStatus = (offer, now = new Date()) => {
  if (
    offer.status === OFFER_STATUS.OFFERED &&
    offer.expiresAt &&
    new Date(offer.expiresAt).getTime() <= now.getTime()
  ) {
    return OFFER_STATUS.IGNORED;
  }

  return offer.status;
};

const toMetricOffer = (offer, now = new Date()) => ({
  id: offer.id,
  orderId: Number(offer.orderId),
  driverId: Number(offer.driverId),
  status: normalizeOfferStatus(offer, now),
  rawStatus: offer.status,
  cancellationChargeable: Boolean(offer.cancellationChargeable),
  offeredAt: offer.offeredAt,
  respondedAt: offer.respondedAt,
  expiresAt: offer.expiresAt,
});

const isEligibleForAR = (status) =>
  ACCEPTED_OFFER_STATUSES.includes(status) || REJECTED_OFFER_STATUSES.includes(status);

const isAcceptedForAR = (status) => ACCEPTED_OFFER_STATUSES.includes(status);

const findOffer = (orderId, driverId, options = {}) =>
  DriverOffer.findOne({
    where: { orderId, driverId },
    order: [["offered_at", "DESC"]],
    ...options,
  });

const upsertOffer = async ({ orderId, driverId, candidate = {}, dispatch = {}, status, reason = null }, options = {}) => {
  if (!Number.isInteger(Number(orderId)) || !Number.isInteger(Number(driverId))) {
    return null;
  }

  const now = new Date();
  const [offer] = await DriverOffer.findOrCreate({
    where: { orderId: Number(orderId), driverId: Number(driverId) },
    defaults: {
      orderId: Number(orderId),
      driverId: Number(driverId),
      status,
      algorithm: dispatch.algorithm || null,
      searchRadiusKm: dispatch.searchRadiusKm ?? null,
      distanceKm: candidate.distanceKm ?? null,
      pickupEtaMinutes: candidate.pickupEtaMinutes ?? null,
      dispatchScore: candidate.dispatchScore ?? null,
      offeredAt: now,
      respondedAt: status === OFFER_STATUS.OFFERED ? null : now,
      expiresAt: addMinutes(now, OFFER_TTL_SECONDS / 60),
      responseReason: reason,
    },
    ...options,
  });

  const terminalStatuses = [OFFER_STATUS.REJECTED, OFFER_STATUS.DRIVER_CANCELLED, OFFER_STATUS.COMPLETED];
  if (terminalStatuses.includes(offer.status) && offer.status !== status) {
    return offer;
  }

  const nextValues = {
    status,
    algorithm: dispatch.algorithm || offer.algorithm,
    searchRadiusKm: dispatch.searchRadiusKm ?? offer.searchRadiusKm,
    distanceKm: candidate.distanceKm ?? offer.distanceKm,
    pickupEtaMinutes: candidate.pickupEtaMinutes ?? offer.pickupEtaMinutes,
    dispatchScore: candidate.dispatchScore ?? offer.dispatchScore,
    responseReason: reason ?? offer.responseReason,
  };

  if (status !== OFFER_STATUS.OFFERED) {
    nextValues.respondedAt = now;
  }

  await offer.update(nextValues, options);
  return offer;
};

const recordDispatchOffers = async ({ orderId, dispatch, acceptedDriverId = null }, options = {}) => {
  const candidates = Array.isArray(dispatch?.candidates) ? dispatch.candidates : [];
  const offers = [];

  for (const candidate of candidates) {
    const driverId = Number(candidate.driverId || candidate.id);
    if (!Number.isInteger(driverId) || driverId <= 0) {
      continue;
    }

    const isAccepted = acceptedDriverId && Number(acceptedDriverId) === driverId;
    if (acceptedDriverId && !isAccepted) {
      continue;
    }

    offers.push(
      await upsertOffer(
        {
          orderId,
          driverId,
          candidate,
          dispatch,
          status: isAccepted ? OFFER_STATUS.ACCEPTED : OFFER_STATUS.OFFERED,
        },
        options
      )
    );
  }

  return offers.filter(Boolean);
};

const markOfferAccepted = async (orderId, driverId, options = {}) =>
  upsertOffer({ orderId, driverId, status: OFFER_STATUS.ACCEPTED }, options);

const countConsecutiveRejections = async (driverId) => {
  const now = new Date();
  const offers = await DriverOffer.findAll({
    where: { driverId },
    order: [["offered_at", "DESC"]],
    limit: 20,
  });

  let count = 0;
  for (const offer of offers) {
    const status = normalizeOfferStatus(offer, now);
    if (REJECTED_OFFER_STATUSES.includes(status)) {
      count += 1;
      continue;
    }
    break;
  }

  return count;
};

const getActivePenalty = async (driverId) => {
  const now = new Date();
  return DriverPenalty.findOne({
    where: {
      driverId,
      status: "ACTIVE",
      startsAt: { [Op.lte]: now },
      [Op.or]: [{ endsAt: null }, { endsAt: { [Op.gt]: now } }],
    },
    order: [["ends_at", "DESC"]],
  });
};

const getActivePenaltyDriverIds = async (driverIds = []) => {
  const ids = driverIds.map(Number).filter((id) => Number.isInteger(id) && id > 0);
  if (!ids.length) {
    return new Set();
  }

  const now = new Date();
  const penalties = await DriverPenalty.findAll({
    where: {
      driverId: { [Op.in]: ids },
      status: "ACTIVE",
      startsAt: { [Op.lte]: now },
      [Op.or]: [{ endsAt: null }, { endsAt: { [Op.gt]: now } }],
    },
    attributes: ["driverId"],
  });

  return new Set(penalties.map((penalty) => Number(penalty.driverId)));
};

const getBlockedDriverIdsForOrder = async (orderId) => {
  const normalizedOrderId = Number(orderId);
  if (!Number.isInteger(normalizedOrderId) || normalizedOrderId <= 0) {
    return new Set();
  }

  const offers = await DriverOffer.findAll({
    where: {
      orderId: normalizedOrderId,
      status: { [Op.in]: [OFFER_STATUS.REJECTED, OFFER_STATUS.IGNORED, OFFER_STATUS.DRIVER_CANCELLED] },
    },
    attributes: ["driverId"],
  });

  return new Set(offers.map((offer) => Number(offer.driverId)));
};

const markOfferIgnored = async (orderId, driverId, reason = "OFFER_TIMEOUT", options = {}) => {
  const offer = await findOffer(orderId, driverId, options);
  if (!offer || offer.status !== OFFER_STATUS.OFFERED) {
    return null;
  }

  await offer.update(
    {
      status: OFFER_STATUS.IGNORED,
      respondedAt: new Date(),
      responseReason: reason,
    },
    options
  );

  return offer;
};

const expireExpiredOffersForOrder = async (orderId) => {
  const now = new Date();
  const offers = await DriverOffer.findAll({
    where: {
      orderId,
      status: OFFER_STATUS.OFFERED,
      expiresAt: { [Op.lte]: now },
    },
  });

  for (const offer of offers) {
    await markOfferIgnored(offer.orderId, offer.driverId, "OFFER_TIMEOUT");
  }

  return offers;
};

const getActiveOfferForOrder = async (orderId) => {
  await expireExpiredOffersForOrder(orderId);

  return DriverOffer.findOne({
    where: {
      orderId,
      status: OFFER_STATUS.OFFERED,
      expiresAt: { [Op.gt]: new Date() },
    },
    order: [["offered_at", "DESC"]],
  });
};

const getActiveOfferForDriverOrder = async (orderId, driverId) => {
  await expireExpiredOffersForOrder(orderId);

  return DriverOffer.findOne({
    where: {
      orderId,
      driverId,
      status: OFFER_STATUS.OFFERED,
      expiresAt: { [Op.gt]: new Date() },
    },
    order: [["offered_at", "DESC"]],
  });
};

const getOfferedOrderIdsForDriver = async (driverId) => {
  const offers = await DriverOffer.findAll({
    where: {
      driverId,
      status: OFFER_STATUS.OFFERED,
      expiresAt: { [Op.gt]: new Date() },
    },
    attributes: ["orderId"],
    order: [["offered_at", "DESC"]],
  });

  return offers.map((offer) => Number(offer.orderId));
};

const ensureRejectionCooldownIfNeeded = async (driverId) => {
  const consecutiveRejections = await countConsecutiveRejections(driverId);
  if (consecutiveRejections < REJECTION_COOLDOWN_THRESHOLD) {
    return { consecutiveRejections, penalty: null };
  }

  const activePenalty = await getActivePenalty(driverId);
  if (activePenalty) {
    return { consecutiveRejections, penalty: activePenalty };
  }

  const now = new Date();
  const penalty = await DriverPenalty.create({
    driverId,
    type: "AR_COOLDOWN",
    status: "ACTIVE",
    reason: `Từ chối/bỏ qua ${consecutiveRejections} đơn liên tiếp`,
    startsAt: now,
    endsAt: addMinutes(now, REJECTION_COOLDOWN_MINUTES),
  });

  return { consecutiveRejections, penalty };
};

const rejectOffer = async (orderId, driverId, reason = "") => {
  const existing = await findOffer(orderId, driverId);
  if (!existing) {
    const error = new Error("No active offer found for this order");
    error.statusCode = 409;
    throw error;
  }

  if (ACCEPTED_OFFER_STATUSES.includes(existing.status)) {
    const error = new Error("Cannot reject an order after accepting it");
    error.statusCode = 409;
    throw error;
  }

  if (existing.status !== OFFER_STATUS.OFFERED) {
    const error = new Error("Offer is no longer active");
    error.statusCode = 409;
    throw error;
  }

  if (existing.expiresAt && new Date(existing.expiresAt).getTime() <= Date.now()) {
    await markOfferIgnored(orderId, driverId, "OFFER_TIMEOUT");
    const error = new Error("Offer has expired");
    error.statusCode = 409;
    throw error;
  }

  const offer = await upsertOffer({
    orderId,
    driverId,
    status: OFFER_STATUS.REJECTED,
    reason: String(reason || "").trim() || "DRIVER_REJECTED",
  });
  const cooldown = await ensureRejectionCooldownIfNeeded(driverId);

  return { offer, cooldown };
};

const isChargeableCancellation = (reasonCode) => {
  const exemptReasons = new Set(["CUSTOMER_REQUEST", "SYSTEM_ISSUE"]);
  return !exemptReasons.has(String(reasonCode || "").toUpperCase());
};

const markDriverCancelled = async (orderId, driverId, reasonCode, options = {}) => {
  const chargeable = isChargeableCancellation(reasonCode);
  const offer = await upsertOffer(
    {
      orderId,
      driverId,
      status: OFFER_STATUS.DRIVER_CANCELLED,
      reason: reasonCode,
    },
    options
  );
  await offer.update({ cancellationChargeable: chargeable }, options);
  return offer;
};

const markOrderCompleted = async (orderId, driverId, options = {}) => {
  const offer = await findOffer(orderId, driverId, options);
  if (!offer || offer.status === OFFER_STATUS.DRIVER_CANCELLED) {
    return offer;
  }

  await offer.update({ status: OFFER_STATUS.COMPLETED, respondedAt: offer.respondedAt || new Date() }, options);
  return offer;
};

const getRollingOffers = async (driverId, limit = AR_WINDOW_SIZE) => {
  const now = new Date();
  const offers = await DriverOffer.findAll({
    where: { driverId },
    order: [["offered_at", "DESC"]],
    limit: Math.max(limit * 3, limit),
  });

  return offers.map((offer) => toMetricOffer(offer, now)).filter((offer) => isEligibleForAR(offer.status)).slice(0, limit);
};

const getRollingAcceptedOffers = async (driverId, limit = CR_WINDOW_SIZE) => {
  const offers = await DriverOffer.findAll({
    where: {
      driverId,
      status: { [Op.in]: ACCEPTED_OFFER_STATUSES },
    },
    order: [["offered_at", "DESC"]],
    limit,
  });

  return offers.map((offer) => toMetricOffer(offer));
};

const calculateDriverMetrics = async (driverId) => {
  const normalizedDriverId = Number(driverId);
  const [driver, rollingOffers, rollingAcceptedOffers, activePenalty] = await Promise.all([
    User.findByPk(normalizedDriverId, { attributes: ["id", "ratingAvg"] }),
    getRollingOffers(normalizedDriverId, AR_WINDOW_SIZE),
    getRollingAcceptedOffers(normalizedDriverId, CR_WINDOW_SIZE),
    getActivePenalty(normalizedDriverId),
  ]);

  const arAccepted = rollingOffers.filter((offer) => isAcceptedForAR(offer.status)).length;
  const arTotal = rollingOffers.length;
  const cancelledWindow = rollingAcceptedOffers.filter(
    (offer) => offer.status === OFFER_STATUS.DRIVER_CANCELLED && offer.cancellationChargeable
  );
  const ratingCount = await Review.count({
    where: { targetType: "DRIVER", targetId: normalizedDriverId },
  });
  const consecutiveRejections = await countConsecutiveRejections(normalizedDriverId);
  const acceptanceRate = percent(arAccepted, arTotal, 100);
  const cancellationRate = percent(cancelledWindow.length, rollingAcceptedOffers.length, 0);
  const ratingAvg = Number(Number(driver?.ratingAvg ?? 5).toFixed(2));
  const rewardEligible =
    acceptanceRate >= REWARD_AR_THRESHOLD &&
    cancellationRate <= REWARD_CR_THRESHOLD &&
    ratingAvg >= REWARD_RATING_THRESHOLD;

  return {
    driverId: normalizedDriverId,
    windows: {
      acceptance: AR_WINDOW_SIZE,
      cancellation: CR_WINDOW_SIZE,
    },
    acceptanceRate: {
      value: acceptanceRate,
      accepted: arAccepted,
      total: arTotal,
      threshold: REWARD_AR_THRESHOLD,
      projectedAfterReject: percent(arAccepted, arTotal + 1, 100),
    },
    cancellationRate: {
      value: cancellationRate,
      cancelled: cancelledWindow.length,
      accepted: rollingAcceptedOffers.length,
      threshold: REWARD_CR_THRESHOLD,
      severeThreshold: CR_SUSPENSION_THRESHOLD,
      projectedAfterCancel: percent(cancelledWindow.length + 1, rollingAcceptedOffers.length || 1, 0),
    },
    rating: {
      value: ratingAvg,
      count: ratingCount,
      threshold: REWARD_RATING_THRESHOLD,
      minimumThreshold: MIN_RATING_THRESHOLD,
    },
    consecutiveRejections,
    rewardEligible,
    penalty: activePenalty
      ? {
          id: Number(activePenalty.id),
          type: activePenalty.type,
          reason: activePenalty.reason,
          startsAt: activePenalty.startsAt,
          endsAt: activePenalty.endsAt,
        }
      : null,
    consequences: {
      rejectCooldownAt: REJECTION_COOLDOWN_THRESHOLD,
      rejectCooldownMinutes: REJECTION_COOLDOWN_MINUTES,
      crSuspensionAt: CR_SUSPENSION_THRESHOLD,
      crSuspensionHours: CR_SUSPENSION_HOURS,
      ratingRetrainingBelow: MIN_RATING_THRESHOLD,
    },
  };
};

const applyCancellationConsequencesIfNeeded = async (driverId) => {
  const metrics = await calculateDriverMetrics(driverId);
  if (metrics.cancellationRate.value < CR_SUSPENSION_THRESHOLD) {
    return { metrics, penalty: null };
  }

  const activePenalty = await getActivePenalty(driverId);
  if (activePenalty) {
    return { metrics, penalty: activePenalty };
  }

  const now = new Date();
  const penalty = await DriverPenalty.create({
    driverId,
    type: "CR_SUSPENSION",
    status: "ACTIVE",
    reason: `CR ${metrics.cancellationRate.value}% vượt ngưỡng ${CR_SUSPENSION_THRESHOLD}%`,
    startsAt: now,
    endsAt: addHours(now, CR_SUSPENSION_HOURS),
  });

  return { metrics, penalty };
};

module.exports = {
  ACCEPTED_OFFER_STATUSES,
  CR_SUSPENSION_THRESHOLD,
  OFFER_STATUS,
  OFFER_TTL_SECONDS,
  REJECTION_COOLDOWN_THRESHOLD,
  calculateDriverMetrics,
  ensureRejectionCooldownIfNeeded,
  getActivePenalty,
  getActivePenaltyDriverIds,
  getActiveOfferForDriverOrder,
  getActiveOfferForOrder,
  getBlockedDriverIdsForOrder,
  getOfferedOrderIdsForDriver,
  markOfferIgnored,
  isChargeableCancellation,
  markDriverCancelled,
  markOfferAccepted,
  markOrderCompleted,
  recordDispatchOffers,
  rejectOffer,
  applyCancellationConsequencesIfNeeded,
};
