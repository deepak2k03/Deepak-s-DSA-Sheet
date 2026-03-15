const AuditLog = require('../models/AuditLog');

const getClientIp = (req) =>
  (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() ||
  req.socket?.remoteAddress ||
  '';

const writeAuditLog = async (req, details) => {
  try {
    await AuditLog.create({
      actorId: req.userId || null,
      actorEmail: details.actorEmail || '',
      action: details.action,
      entityType: details.entityType || 'system',
      entityId: details.entityId || '',
      metadata: details.metadata || {},
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'] || '',
    });
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};

module.exports = {
  writeAuditLog,
};
