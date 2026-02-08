export const logAccess = async (AccessLog, userId, action, resource, resourceId, granted, reason = '') => {
  try {
    await AccessLog.create({
      userId,
      action,
      resource,
      resourceId: resourceId || undefined,
      granted,
      reason,
    });
  } catch (err) {
    console.error('Access log error:', err.message);
  }
};
