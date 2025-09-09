const CashAdvance = require("../models/CashAdvance");
const CompanyStaff = require("../models/CompanyStaff");

// @desc    Create new cash advance request
// @route   POST /api/cash-advance
// @access  Private
exports.createCashAdvance = async (req, res, next) => {
  try {
    const {
      purpose,
      amount,
      currency,
      neededBy,
      description,
      projectCode,
      paymentMethod,
    } = req.body;

    // Validation
    if (
      !purpose ||
      !amount ||
      !currency ||
      !neededBy ||
      !description ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: purpose, amount, currency, neededBy, description, paymentMethod",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    // Get staff information from authenticated user (you'll add auth later)
    // For now, we'll use the staff ID from request body or mock it
    const staffId = req.body.staffId || req.user?.id; // Adjust based on your auth setup

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: "Staff information is required",
      });
    }

    // Fetch staff details
    const staff = await CompanyStaff.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    // Create cash advance request
    const cashAdvance = await CashAdvance.create({
      staffId: staff._id,
      staffName: `${staff.firstName} ${staff.lastName}`,
      staffEmail: staff.email,
      purpose,
      amount: parseFloat(amount),
      currency,
      neededBy: new Date(neededBy),
      description,
      projectCode: projectCode || "",
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: "Cash advance request submitted successfully",
      cashAdvance,
    });
  } catch (error) {
    console.error("Create cash advance error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error creating cash advance request",
    });
  }
};

// @desc    Get all cash advance requests
// @route   GET /api/cash-advance
// @access  Private
exports.getAllCashAdvances = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, staffId } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (staffId) {
      query.staffId = staffId;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: {
        path: "staffId",
        select: "firstName lastName email staffId department",
      },
    };

    const cashAdvances = await CashAdvance.find(query)
      .sort({ createdAt: -1 })
      .populate("staffId", "firstName lastName email staffId department")
      .populate("approvedBy", "firstName lastName");

    res.status(200).json({
      success: true,
      count: cashAdvances.length,
      cashAdvances,
    });
  } catch (error) {
    console.error("Get cash advances error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching cash advance requests",
    });
  }
};

// @desc    Get single cash advance request
// @route   GET /api/cash-advance/:id
// @access  Private
exports.getCashAdvance = async (req, res, next) => {
  try {
    const cashAdvance = await CashAdvance.findById(req.params.id)
      .populate(
        "staffId",
        "firstName lastName email staffId department phone jobRole"
      )
      .populate("approvedBy", "firstName lastName email");

    if (!cashAdvance) {
      return res.status(404).json({
        success: false,
        message: "Cash advance request not found",
      });
    }

    res.status(200).json({
      success: true,
      cashAdvance,
    });
  } catch (error) {
    console.error("Get cash advance error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid cash advance ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error fetching cash advance request",
    });
  }
};

// @desc    Get cash advances for specific staff
// @route   GET /api/cash-advance/staff/:staffId
// @access  Private
exports.getStaffCashAdvances = async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = { staffId: req.params.staffId };

    if (status) {
      query.status = status;
    }

    const cashAdvances = await CashAdvance.find(query)
      .sort({ createdAt: -1 })
      .populate("approvedBy", "firstName lastName");

    res.status(200).json({
      success: true,
      count: cashAdvances.length,
      cashAdvances,
    });
  } catch (error) {
    console.error("Get staff cash advances error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error fetching staff cash advances",
    });
  }
};

// @desc    Update cash advance status
// @route   PUT /api/cash-advance/:id/status
// @access  Private (Admin/Finance only)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const updateData = { status };

    if (status === "approved") {
      updateData.approvedBy = req.user.id; // From authentication
      updateData.approvedAt = new Date();
      updateData.rejectionReason = "";
    } else if (status === "rejected") {
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required when rejecting a request",
        });
      }
      updateData.rejectionReason = rejectionReason;
      updateData.approvedBy = null;
      updateData.approvedAt = null;
    } else if (status === "disbursed") {
      updateData.disbursedAt = new Date();
    } else if (status === "retired") {
      updateData.retiredAt = new Date();
    }

    const cashAdvance = await CashAdvance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("staffId", "firstName lastName email")
      .populate("approvedBy", "firstName lastName");

    if (!cashAdvance) {
      return res.status(404).json({
        success: false,
        message: "Cash advance request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Cash advance request ${status} successfully`,
      cashAdvance,
    });
  } catch (error) {
    console.error("Update status error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid cash advance ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error updating cash advance status",
    });
  }
};

// @desc    Add retirement notes
// @route   PUT /api/cash-advance/:id/retirement
// @access  Private
exports.addRetirementNotes = async (req, res, next) => {
  try {
    const { retirementNotes } = req.body;

    if (!retirementNotes) {
      return res.status(400).json({
        success: false,
        message: "Retirement notes are required",
      });
    }

    const cashAdvance = await CashAdvance.findByIdAndUpdate(
      req.params.id,
      {
        retirementNotes,
        status: "retired",
        retiredAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!cashAdvance) {
      return res.status(404).json({
        success: false,
        message: "Cash advance request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Retirement notes added successfully",
      cashAdvance,
    });
  } catch (error) {
    console.error("Add retirement notes error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid cash advance ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error adding retirement notes",
    });
  }
};

// @desc    Get cash advance statistics
// @route   GET /api/cash-advance/stats/overview
// @access  Private (Admin/Finance only)
exports.getStats = async (req, res, next) => {
  try {
    const totalRequests = await CashAdvance.countDocuments();
    const pendingRequests = await CashAdvance.countDocuments({
      status: "pending",
    });
    const approvedRequests = await CashAdvance.countDocuments({
      status: "approved",
    });
    const disbursedRequests = await CashAdvance.countDocuments({
      status: "disbursed",
    });

    const totalAmount = await CashAdvance.aggregate([
      { $match: { status: { $in: ["approved", "disbursed", "retired"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        disbursedRequests,
        totalAmount: totalAmount[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching statistics",
    });
  }
};
