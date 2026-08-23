import express from "express";
import { updateUserData } from "../controllers/UserController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../configs/multer.js";
import User from "../models/User.js";
import { clerkClient } from "@clerk/express";

const userRouter = express.Router();

// Get logged in user profile
userRouter.get("/profile", protect, async (req, res) => {
  try {
    const auth = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = auth?.userId;
    
    let user = await User.findById(userId);
    if (!user) {
      // Fallback: sync user from Clerk on first load if MongoDB didn't catch it
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        let username = clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] || `user_${userId}`;
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
          username = username + Math.floor(Math.random() * 10000);
        }
        
        user = await User.create({
          _id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          full_name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || username,
          profile_picture: clerkUser.imageUrl,
          username,
        });
      } catch (err) {
        console.error("Clerk fallback fetch error:", err.message);
        return res.json({ success: false, message: "User not found and sync failed" });
      }
    }
    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Get user profile by ID
userRouter.get("/profile/:profileId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.profileId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Update user profile
userRouter.post(
  "/update",
  protect,
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  updateUserData
);

// Get discover people list
userRouter.get("/discover", protect, async (req, res) => {
  try {
    const auth = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = auth?.userId;
    
    const { search } = req.query;
    let query = { _id: { $ne: userId } };
    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    const users = await User.find(query);
    res.json({ success: true, users });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Get connections details (followers, following, connections, pending requests)
userRouter.get("/connections-data", protect, async (req, res) => {
  try {
    const auth = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = auth?.userId;
    
    const user = await User.findById(userId)
      .populate("followers")
      .populate("following")
      .populate("connections")
      .populate("connectionRequests");
      
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    res.json({
      success: true,
      followers: user.followers || [],
      following: user.following || [],
      connections: user.connections || [],
      pending: user.connectionRequests || [],
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Toggle follow
userRouter.post("/:targetUserId/follow", protect, async (req, res) => {
  try {
    const auth = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = auth?.userId;
    const { targetUserId } = req.params;
    
    if (userId === targetUserId) {
      return res.json({ success: false, message: "You cannot follow yourself" });
    }
    
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);
    
    if (!user || !targetUser) {
      return res.json({ success: false, message: "User not found" });
    }
    
    const isFollowing = user.following.includes(targetUserId);
    if (isFollowing) {
      // Unfollow
      user.following = user.following.filter(id => id !== targetUserId);
      targetUser.followers = targetUser.followers.filter(id => id !== userId);
    } else {
      // Follow
      user.following.push(targetUserId);
      targetUser.followers.push(userId);
    }
    
    await user.save();
    await targetUser.save();
    
    res.json({ success: true, isFollowing: !isFollowing });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Send or accept connection request
userRouter.post("/:targetUserId/connect", protect, async (req, res) => {
  try {
    const auth = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = auth?.userId;
    const { targetUserId } = req.params;
    
    if (userId === targetUserId) {
      return res.json({ success: false, message: "You cannot connect with yourself" });
    }
    
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);
    
    if (!user || !targetUser) {
      return res.json({ success: false, message: "User not found" });
    }
    
    // Check if they are already connected
    if (user.connections.includes(targetUserId)) {
      return res.json({ success: true, message: "Already connected" });
    }
    
    // Check if target user has sent a request to us (if so, accept it)
    if (user.connectionRequests.includes(targetUserId)) {
      user.connections.push(targetUserId);
      user.connectionRequests = user.connectionRequests.filter(id => id !== targetUserId);
      targetUser.connections.push(userId);
      
      await user.save();
      await targetUser.save();
      return res.json({ success: true, message: "Connection accepted", status: "connected" });
    }
    
    // Otherwise, send a request from us to target user
    if (!targetUser.connectionRequests.includes(userId)) {
      targetUser.connectionRequests.push(userId);
      await targetUser.save();
    }
    
    res.json({ success: true, message: "Connection request sent", status: "pending" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Accept connection request specifically
userRouter.post("/:targetUserId/accept-connection", protect, async (req, res) => {
  try {
    const auth = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = auth?.userId;
    const { targetUserId } = req.params;
    
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);
    
    if (!user || !targetUser) {
      return res.json({ success: false, message: "User not found" });
    }
    
    if (!user.connections.includes(targetUserId)) {
      user.connections.push(targetUserId);
    }
    user.connectionRequests = user.connectionRequests.filter(id => id !== targetUserId);
    
    if (!targetUser.connections.includes(userId)) {
      targetUser.connections.push(userId);
    }
    
    await user.save();
    await targetUser.save();
    
    res.json({ success: true, message: "Connection accepted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

export default userRouter;
