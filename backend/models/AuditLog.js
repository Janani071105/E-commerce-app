const mongoose = require('mongoose');
const auditLogSchema = new mongoose.Schema({
  accountType: { type: String, enum: ['User', 'Seller', 'Admin'], required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'entityModel' },
  entityModel: { type: String, required: true, enum: ['User', 'Seller'] },
  entityName: { type: String, required: true }, 
  actionDetail: { type: String, required: true }, 
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);