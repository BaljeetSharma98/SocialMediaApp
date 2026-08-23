import express from "express";
import { protect } from "../middleware/auth.js";
import { upload } from "../configs/multer.js";
import Story from "../models/Story.js";

const storyRouter = express.Router();

// Get active stories
storyRouter.get("/", protect, async (req, res) => {
  try {
    // Only fetch stories from the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stories = await Story.find({ createdAt: { $gte: oneDayAgo } })
      .populate("user")
      .sort({ createdAt: -1 });
    res.json({ success: true, stories });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Create story
storyRouter.post("/create", protect, upload.single("media"), async (req, res) => {
  try {
    const auth = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = auth?.userId;
    const { content, background_color } = req.body;
    
    let media_url = "";
    let media_type = "text";
    
    if (req.file) {
      media_url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      media_type = req.file.mimetype.startsWith("video") ? "video" : "image";
    }
    
    const newStory = await Story.create({
      user: userId,
      content: content || "",
      media_url,
      media_type,
      background_color: background_color || "#4f46e5",
    });
    
    const populatedStory = await Story.findById(newStory._id).populate("user");
    res.json({ success: true, story: populatedStory });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

export default storyRouter;
