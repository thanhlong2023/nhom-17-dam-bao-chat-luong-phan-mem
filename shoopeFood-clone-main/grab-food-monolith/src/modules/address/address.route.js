const express = require("express");
const addressController = require("./address.controller");
const auth = require("../../middleware/auth");

const router = express.Router();

router.get("/suggest", addressController.suggest);
router.get("/detail/:placeId", addressController.detail);
router.get("/reverse", addressController.reverse);
router.get("/mine", auth, addressController.listMine);
router.post("/mine", auth, addressController.createMine);
router.put("/mine/:id", auth, addressController.updateMine);
router.delete("/mine/:id", auth, addressController.deleteMine);

module.exports = router;
