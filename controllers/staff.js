const CompanyStaff = require("../models/CompanyStaff");
const { generateToken } = require("../utils/jwt");

// @desc    Register a new company staff
// @route   POST /api/staff/register
// @access  Public
exports.registerStaff = async (req, res, next) => {
  try {
    const { email, firstName, lastName, phone, staffId, jobRole, department } =
      req.body;

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
      department: department || "",
    });

    // Generate token (if you still want to authenticate them immediately)
    const token = generateToken(staff._id);

    res.status(201).json({
      success: true,
      message: "Staff registered successfully",
      token,
      staff: {
        id: staff._id,
        email: staff.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        phone: staff.phone,
        staffId: staff.staffId,
        jobRole: staff.jobRole,
        department: staff.department,
        isActive: staff.isActive,
        isVerified: staff.isVerified,
        createdAt: staff.createdAt,
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

// @desc    Get all company staff
// @route   GET /api/staff
// @access  Private (add authentication middleware later)
exports.getAllStaff = async (req, res, next) => {
  try {
    const staff = await CompanyStaff.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: staff.length,
      staff,
    });
  } catch (error) {
    console.error("Get all staff error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching staff data",
    });
  }
};

// @desc    Get single staff member
// @route   GET /api/staff/:id
// @access  Private
exports.getStaff = async (req, res, next) => {
  try {
    const staff = await CompanyStaff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    res.status(200).json({
      success: true,
      staff,
    });
  } catch (error) {
    console.error("Get staff error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error fetching staff data",
    });
  }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private
exports.updateStaff = async (req, res, next) => {
  try {
    const {
      email,
      firstName,
      lastName,
      phone,
      staffId,
      jobRole,
      department,
      isActive,
      isVerified,
    } = req.body;

    // Check if email is being updated and if it already exists
    if (email) {
      const existingStaff = await CompanyStaff.findOne({
        email,
        _id: { $ne: req.params.id },
      });

      if (existingStaff) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Check if staffId is being updated and if it already exists
    if (staffId) {
      const existingStaff = await CompanyStaff.findOne({
        staffId,
        _id: { $ne: req.params.id },
      });

      if (existingStaff) {
        return res.status(400).json({
          success: false,
          message: "Staff ID already exists",
        });
      }
    }

    const staff = await CompanyStaff.findByIdAndUpdate(
      req.params.id,
      {
        email,
        firstName,
        lastName,
        phone,
        staffId,
        jobRole,
        department,
        isActive,
        isVerified,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      staff,
    });
  } catch (error) {
    console.error("Update staff error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID",
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error updating staff",
    });
  }
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private
exports.deleteStaff = async (req, res, next) => {
  try {
    const staff = await CompanyStaff.findByIdAndDelete(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Staff member deleted successfully",
    });
  } catch (error) {
    console.error("Delete staff error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error deleting staff",
    });
  }
};

// @desc    Search staff members
// @route   GET /api/staff/search/:query
// @access  Private
exports.searchStaff = async (req, res, next) => {
  try {
    const { query } = req.params;

    const staff = await CompanyStaff.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { staffId: { $regex: query, $options: "i" } },
        { jobRole: { $regex: query, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: staff.length,
      staff,
    });
  } catch (error) {
    console.error("Search staff error:", error);
    res.status(500).json({
      success: false,
      message: "Server error searching staff",
    });
  }
};
