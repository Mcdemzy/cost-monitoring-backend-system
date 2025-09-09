const express = require("express");
const router = express.Router();
const {
  createCashAdvance,
  getAllCashAdvances,
  getCashAdvance,
  getStaffCashAdvances,
  updateStatus,
  addRetirementNotes,
  getStats,
} = require("../controllers/cashAdvance");

// Public routes
router.post("/", createCashAdvance);

// Protected routes
router.get("/", getAllCashAdvances);
router.get("/stats/overview", getStats);
router.get("/staff/:staffId", getStaffCashAdvances);
router.get("/:id", getCashAdvance);
router.put("/:id/status", updateStatus);
router.put("/:id/retirement", addRetirementNotes);

module.exports = router;
