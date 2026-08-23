import express from "express";
import { protect } from "../middleware/auth.js";
import { upload } from "../configs/multer.js";
import Post from "../models/Post.js";

const postRouter = express.Router();

// Get all feed posts
postRouter.get("/feed", protect, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user")
      .sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Create new post
postRouter.post("/create", protect, upload.array("images", 5), async (req, res) => {
  try {
    const auth = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = auth?.userId;
    const { content } = req.body;
    
    const image_urls = req.files ? req.files.map(file => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`) : [];
    
    let post_type = "text";
    if (image_urls.length > 0 && content) {
      post_type = "text_with_image";
    } else if (image_urls.length > 0) {
      post_type = "image";
    }
    
    const newPost = await Post.create({
      user: userId,
      content: content || "",
      image_urls,
      post_type,
      likes_count: [],
    });
    
    const populatedPost = await Post.findById(newPost._id).populate("user");
    res.json({ success: true, post: populatedPost });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Like / unlike post
postRouter.post("/:postId/like", protect, async (req, res) => {
  try {
    const auth = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = auth?.userId;
    const { postId } = req.params;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.json({ success: false, message: "Post not found" });
    }
    
    const index = post.likes_count.indexOf(userId);
    if (index === -1) {
      post.likes_count.push(userId);
    } else {
      post.likes_count.splice(index, 1);
    }
    
    await post.save();
    res.json({ success: true, likes_count: post.likes_count });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

export default postRouter;
