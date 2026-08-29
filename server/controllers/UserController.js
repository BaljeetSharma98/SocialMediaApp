import User from "../models/User.js";

// Update User Data
export const updateUserData = async (req, res) => {
  try {
    const auth = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = auth?.userId;
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

    const updatedFields = {
      username,
      bio,
      location,
      full_name,
    };

    if (req.files) {
      if (req.files.profile && req.files.profile[0]) {
        const profileFile = req.files.profile[0];
        updatedFields.profile_picture = `${req.protocol}://${req.get("host")}/uploads/${profileFile.filename}`;
      }
      if (req.files.cover && req.files.cover[0]) {
        const coverFile = req.files.cover[0];
        updatedFields.cover_photo = `${req.protocol}://${req.get("host")}/uploads/${coverFile.filename}`;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, { new: true });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
