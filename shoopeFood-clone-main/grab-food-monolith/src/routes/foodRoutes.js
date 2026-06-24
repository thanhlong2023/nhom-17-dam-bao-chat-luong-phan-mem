const express = require("express");
const foodController = require("../controllers/foodController");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

const router = express.Router();

router.get("/", foodController.getAllFoods);
router.get("/:id", foodController.getFoodById);
router.post("/", auth, requireRole(["ADMIN", "MERCHANT"]), foodController.createFood);
router.put("/:id", auth, requireRole(["ADMIN", "MERCHANT"]), foodController.updateFood);
router.delete("/:id", auth, requireRole(["ADMIN", "MERCHANT"]), foodController.deleteFood);

module.exports = router;
