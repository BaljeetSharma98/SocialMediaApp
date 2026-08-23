import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: { type: String, ref: "User", required: true },
    content: { type: String, default: "" },
    media_url: { type: String, default: "" },
    media_type: { type: String, enum: ["text", "image", "video"], default: "text" },
    background_color: { type: String, default: "#4f46e5" },
  },
  { timestamps: true }
);

// Auto-expire stories after 24 hours (86400 seconds) using a Mongoose TTL index
storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Story = mongoose.model("Story", storySchema);
export default Story;
