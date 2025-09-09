const express = require("express");
const router = express.Router();
const { registerStaff } = require("../controllers/staff");

router.post("/register-staff", registerStaff);

module.exports = router;
