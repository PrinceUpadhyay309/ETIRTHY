const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    action: {
      type: String,
      required: true
    },
    entityType: {
      type: String, // booking, user, payment, auth
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    //   required: false
    },
    meta: {
      type: Object // optional extra data
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
