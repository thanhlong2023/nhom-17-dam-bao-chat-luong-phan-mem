const express = require("express");
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

const router = express.Router();

// Apply auth and ADMIN role to all routes in this file
router.use(auth, requireRole(["ADMIN"]));

// Vouchers
router.get("/vouchers", adminController.getVouchers);
router.get("/vouchers/:id", adminController.getVoucherById);
router.post("/vouchers", adminController.createVoucher);
router.put("/vouchers/:id", adminController.updateVoucher);
router.delete("/vouchers/:id", adminController.deleteVoucher);

// System Settings
router.get("/settings", adminController.getSettings);
router.post("/settings", adminController.createSetting);
router.put("/settings/:id", adminController.updateSetting);
router.delete("/settings/:id", adminController.deleteSetting);

module.exports = router;
