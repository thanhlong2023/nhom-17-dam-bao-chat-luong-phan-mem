const express = require("express");
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

const router = express.Router();

router.get("/me", auth, userController.getProfile);
router.get("/merchants", auth, requireRole(["ADMIN"]), userController.listMerchants);
router.post("/merchants", auth, requireRole(["ADMIN"]), userController.createMerchant);
router.get("/", auth, requireRole(["ADMIN"]), userController.getUsers);
router.get("/:id", auth, requireRole(["ADMIN"]), userController.getUserById);
router.post("/", auth, requireRole(["ADMIN"]), userController.createUser);
router.put("/:id", auth, requireRole(["ADMIN"]), userController.updateUser);
router.delete("/:id", auth, requireRole(["ADMIN"]), userController.deleteUser);

module.exports = router;
