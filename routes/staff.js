const express = require("express");
const router = express.Router();
const {
  registerStaff,
  getAllStaff,
  getStaff,
  updateStaff,
  deleteStaff,
  searchStaff,
} = require("../controllers/staff");

// Public routes
router.post("/register", registerStaff);

// Protected routes (add authentication middleware later)
router.get("/", getAllStaff);
router.get("/search/:query", searchStaff);
router.get("/:id", getStaff);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);

module.exports = router;
