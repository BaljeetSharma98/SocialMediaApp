import express from "express";
import { protect } from "../middleware/auth.js";
import { upload } from "../configs/multer.js";
import Message from "../models/Message.js";

const messageRouter = express.Router();

// Get recent messages list (grouped by partner)
messageRouter.get("/recent", protect, async (req, res) => {
  try {
    const auth = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = auth?.userId;
    
    const messages = await Message.find({
      $or: [{ from_user_id: userId }, { to_user_id: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("from_user_id")
      .populate("to_user_id");
      
    const recentMap = {};
    messages.forEach((msg) => {
      const partner = msg.from_user_id._id === userId ? msg.to_user_id : msg.from_user_id;
      if (!partner) return;
      if (!recentMap[partner._id]) {
        recentMap[partner._id] = {
          _id: msg._id,
          from_user_id: msg.from_user_id,
          to_user_id: msg.to_user_id,
          text: msg.text,
          message_type: msg.message_type,
          media_url: msg.media_url,
          seen: msg.seen,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt,
        };
      }
    });
    
    res.json({ success: true, recentMessages: Object.values(recentMap) });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Get chat history with another user
messageRouter.get("/:partnerId", protect, async (req, res) => {
  try {
    const auth = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = auth?.userId;
    const { partnerId } = req.params;
    
    // Mark messages from partner as seen
    await Message.updateMany(
      { from_user_id: partnerId, to_user_id: userId, seen: false },
      { seen: true }
    );
    
    const messages = await Message.find({
      $or: [
        { from_user_id: userId, to_user_id: partnerId },
        { from_user_id: partnerId, to_user_id: userId },
      ],
    }).sort({ createdAt: 1 });
    
    res.json({ success: true, messages });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Send a message
messageRouter.post("/send", protect, upload.single("image"), async (req, res) => {
  try {
    const auth = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = auth?.userId;
    const { to_user_id, text } = req.body;
    
    let media_url = "";
    let message_type = "text";
    
    if (req.file) {
      media_url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      message_type = "image";
    }
    
    const newMessage = await Message.create({
      from_user_id: userId,
      to_user_id,
      text: text || "",
      media_url,
      message_type,
      seen: false,
    });
    
    res.json({ success: true, message: newMessage });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

export default messageRouter;
