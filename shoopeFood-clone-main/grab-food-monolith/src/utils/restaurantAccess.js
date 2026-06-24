const { Restaurant } = require("../models");
const { resolveUserRoles } = require("./roleResolver");

const getManagedRestaurant = async (req, restaurantId) => {
  const normalizedRestaurantId = Number(restaurantId);
  if (!Number.isInteger(normalizedRestaurantId) || normalizedRestaurantId <= 0) {
    return { status: 400, message: "Invalid restaurantId", restaurant: null };
  }

  const restaurant = await Restaurant.findOne({
    where: { id: normalizedRestaurantId, deletedAt: null },
  });
  if (!restaurant) {
    return { status: 404, message: "Restaurant not found", restaurant: null };
  }

  const { hasRole } = await resolveUserRoles(req);
  const allowed =
    hasRole(["ADMIN"]) ||
    (hasRole(["MERCHANT"]) && Number(restaurant.ownerId) === Number(req.user?.id));

  if (!allowed) {
    return { status: 403, message: "Forbidden", restaurant: null };
  }

  return { status: 200, message: "OK", restaurant };
};

module.exports = {
  getManagedRestaurant,
};
