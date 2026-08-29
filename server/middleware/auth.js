export const protect = async (req, res, next) => {
  try {
    const auth = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = auth?.userId;
    if (!userId) {
      return res.json({ success: false, message: "not authenticated" });
    }
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
