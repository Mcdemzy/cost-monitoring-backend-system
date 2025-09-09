const mongoose = require("mongoose");
const validator = require("validator");

const companyStaffSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    // Removed password field as requested
    firstName: {
      type: String,
      required: [true, "Please provide your first name"],
      trim: true,
      maxlength: [50, "First name cannot be more than 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Please provide your last name"],
      trim: true,
      maxlength: [50, "Last name cannot be more than 50 characters"],
    },
    phone: {
      type: String,
      required: [true, "Please provide a phone number"],
      trim: true,
    },
    staffId: {
      type: String,
      required: [true, "Please provide your staff ID"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    jobRole: {
      type: String,
      required: [true, "Please provide your job role"],
      trim: true,
      maxlength: [100, "Job role cannot be more than 100 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    department: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
companyStaffSchema.index({ email: 1 });
companyStaffSchema.index({ staffId: 1 });
companyStaffSchema.index({ isActive: 1 });

// Removed password-related methods since we don't have a password field

module.exports = mongoose.model("CompanyStaff", companyStaffSchema);
