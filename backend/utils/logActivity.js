const AuditLog = require("../models/AuditLog");

async function logActivity({ adminId, action, entityType, entityId, meta }) {
  try {
    await AuditLog.create({
      adminId,
      action,
      entityType,
      entityId,
      meta
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
}

module.exports = logActivity;
