const AuditLog = require('../models/AuditLog');
const AuditLog = require('../models/AuditLog');
await AuditLog.create({
  accountType: 'User', 
  entityId: user._id,
  entityModel: 'User', 
  entityName: user.name, 
  actionDetail: 'Logged into system successfully'
});
const createAuditLog = async (req, res) => {
  try {
    const { accountType, entityId, entityModel, entityName, actionDetail } = req.body;
    const newLog = new AuditLog({
      accountType,
      entityId,
      entityModel,
      entityName,
      actionDetail,
      timestamp: new Date()
    });

    await newLog.save();
    res.status(201).json({ success: true, message: 'Activity logged successfully', log: newLog });
  } catch (err) {
    console.error("Error saving audit log:", err);
    res.status(500).json({ error: 'Server error saving audit log' });
  }
};
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.status(200).json(logs);
  } catch (err) {
    console.error("Error fetching audit logs:", err);
    res.status(500).json({ error: 'Server error fetching audit logs' });
  }
};
module.exports = {
  createAuditLog,
  getAuditLogs
};