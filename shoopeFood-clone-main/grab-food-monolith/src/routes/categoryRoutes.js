const express = require("express");
const categoryController = require("../controllers/categoryController");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", auth, requireRole(["ADMIN", "MERCHANT"]), categoryController.createCategory);
router.put("/:id", auth, requireRole(["ADMIN", "MERCHANT"]), categoryController.updateCategory);
router.delete("/:id", auth, requireRole(["ADMIN", "MERCHANT"]), categoryController.deleteCategory);

module.exports = router;
