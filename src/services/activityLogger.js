import ActivityLog from "../models/activityLog.model.js";

const logActivity = async ({
  userId = null,
  action,
  entityType,
  entityId = null,
  ipAddress = "",
  metadata = {},
}) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      entityType,
      entityId,
      ipAddress,
      metadata,
    });
  } catch (error) {
    console.error(
      "Activity Logging Failed:",
      error.message
    );
  }
};

export default logActivity;
