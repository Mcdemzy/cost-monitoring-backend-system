const CompanyStaff = require("../models/CompanyStaff");
const { generateToken } = require("../utils/jwt");

// @desc    Register a new company staff
// @route   POST /api/auth/register-staff
// @access  Public
exports.registerStaff = async (req, res, next) => {
  try {
    const { email, firstName, lastName, phone, staffId, jobRole } = req.body;

    // Validation - check all required fields
    if (!email || !firstName || !lastName || !phone || !staffId || !jobRole) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: email, first name, last name, phone, staff ID, and job role",
      });
    }

    // Check if staff already exists with email
    const existingStaffByEmail = await CompanyStaff.findOne({ email });
    if (existingStaffByEmail) {
      return res.status(400).json({
        success: false,
        message: "Staff already exists with this email",
      });
    }

    // Check if staff already exists with staff ID
    const existingStaffById = await CompanyStaff.findOne({ staffId });
    if (existingStaffById) {
      return res.status(400).json({
        success: false,
        message: "Staff ID already exists",
      });
    }

    // Create new staff member
    const staff = await CompanyStaff.create({
      email,
      firstName,
      lastName,
      phone,
      staffId,
      jobRole,
    });

    // Generate token (if you still want to authenticate them immediately)
    const token = generateToken(staff._id);

    res.status(201).json({
      success: true,
      message: "Staff registered successfully",
      token, // Optional: only if you want to log them in immediately
      staff: {
        id: staff._id,
        email: staff.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        phone: staff.phone,
        staffId: staff.staffId,
        jobRole: staff.jobRole,
        isActive: staff.isActive,
        isVerified: staff.isVerified,
      },
    });
  } catch (error) {
    console.error("Staff registration error:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during staff registration",
    });
  }
};
