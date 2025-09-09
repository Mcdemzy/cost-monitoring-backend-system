const mongoose = require("mongoose");

const cashAdvanceSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyStaff",
      required: [true, "Staff ID is required"],
    },
    staffName: {
      type: String,
      required: [true, "Staff name is required"],
      trim: true,
    },
    staffEmail: {
      type: String,
      required: [true, "Staff email is required"],
      trim: true,
      lowercase: true,
    },
    purpose: {
      type: String,
      required: [true, "Purpose is required"],
      trim: true,
      maxlength: [200, "Purpose cannot exceed 200 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    currency: {
      type: String,
      required: true,
      enum: ["USD", "EUR", "GBP", "NGN"],
      default: "USD",
    },
    neededBy: {
      type: Date,
      required: [true, "Needed by date is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    projectCode: {
      type: String,
      trim: true,
      maxlength: [50, "Project code cannot exceed 50 characters"],
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["bank_transfer", "check", "cash"],
      default: "bank_transfer",
    },
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "approved",
        "rejected",
        "disbursed",
        "retired",
        "cancelled",
      ],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyStaff",
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
    },
    disbursedAt: {
      type: Date,
    },
    retiredAt: {
      type: Date,
    },
    retirementNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Retirement notes cannot exceed 1000 characters"],
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
cashAdvanceSchema.index({ staffId: 1, status: 1 });
cashAdvanceSchema.index({ status: 1 });
cashAdvanceSchema.index({ createdAt: -1 });
cashAdvanceSchema.index({ staffEmail: 1 });

// Virtual for formatted amount
cashAdvanceSchema.virtual("formattedAmount").get(function () {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: this.currency,
  }).format(this.amount);
});

// Ensure virtual fields are serialized
cashAdvanceSchema.set("toJSON", { virtuals: true });
cashAdvanceSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("CashAdvance", cashAdvanceSchema);
