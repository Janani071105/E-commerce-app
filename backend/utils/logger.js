const AuditLog = require('../models/AuditLog');
const logActivity = async ({ accountType, entityId, entityName, actionDetail }) => {
  try {
    await AuditLog.create({
      accountType,
      entityId,
      entityName,
      actionDetail
    });
  } catch (error) {
    console.error("Error saving audit log:", error);
  }
};

module.exports = { logActivity };