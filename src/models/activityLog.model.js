import mongoose from "mongoose";

const activityLogSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        default: null,
      },

      action: {
        type: String,

        required: true,
      },

      entityType: {
        type: String,

        required: true,
      },

      entityId: {
        type:
          mongoose.Schema.Types.ObjectId,

        default: null,
      },

      ipAddress: {
        type: String,
      },

      metadata: {
        type: Object,

        default: {},
      },
    },

    {
      timestamps: true,
    }
  );

const ActivityLog = mongoose.model(
  "ActivityLog",
  activityLogSchema
);

export default ActivityLog;