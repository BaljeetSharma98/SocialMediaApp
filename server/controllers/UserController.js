import User from "../models/User.js";

// Update User Data
export const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    let { username, bio, location, full_name } = req.body;

    // Find current user
    const tempUser = await User.findById(userId);
    if (!tempUser) {
      return res.json({ success: false, message: "User not found" });
    }

    // If username is not provided, keep old one
    if (!username) {
      username = tempUser.username;
    }

    // If username is changed, check availability
    if (tempUser.username !== username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        // Username already taken, keep old one
        username = tempUser.username;
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username,
        bio,
        location,
        full_name,
      },
      { new: true }
    );

    const profile=req.files.profile && req.files.profile[0];
    const cover=req.files.cover && req.files.cover[0];

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
