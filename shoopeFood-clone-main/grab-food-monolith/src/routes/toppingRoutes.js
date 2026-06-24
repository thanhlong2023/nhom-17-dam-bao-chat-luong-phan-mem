const express = require("express");
const router = express.Router();
const toppingController = require("../controllers/ToppingController");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");
const manageMenu = [authMiddleware, requireRole(["ADMIN", "MERCHANT"])];

// Restaurant toppings
router.get("/restaurants/:id/toppings", toppingController.listByRestaurant);
router.post("/restaurants/:id/toppings", ...manageMenu, toppingController.createTopping);

// Topping management
router.put("/toppings/:id", ...manageMenu, toppingController.updateTopping);
router.delete("/toppings/:id", ...manageMenu, toppingController.deleteTopping);

// Food toppings
router.get("/foods/:id/toppings", toppingController.listByFood);
router.post("/foods/:id/toppings", ...manageMenu, toppingController.assignToFood);

module.exports = router;
