const express = require('express');
const mongoose = require('mongoose'); 
const router = express.Router();
const { createAuditLog, getAuditLogs } = require('../controllers/auditController');

router.post('/log-activity', createAuditLog);
router.get('/audit-logs', getAuditLogs);

module.exports = router;