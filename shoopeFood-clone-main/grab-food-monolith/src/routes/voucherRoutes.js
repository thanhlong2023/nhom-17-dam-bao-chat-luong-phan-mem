const express = require("express");
const voucherController = require("../controllers/voucherController");
const auth = require("../middleware/auth");

const router = express.Router();

// Lắng nghe API /api/vouchers/validate cho customer
router.post("/validate", auth, voucherController.validateVoucher);

module.exports = router;
