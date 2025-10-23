import User from "../models/User.js";
import logger from "../config/logger.js";

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -resetCode -resetCodeExpires")
      .populate("posts")
      .populate("forums");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.json({
      status: "success",
      message: "User fetched successfully",
      payload: user,
    });
  } catch (err) {
    logger.error("Error getting user:", err);
    res.status(500).json({
      status: "error",
      message: "Error getting user",
      error: err.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { username, email, bio } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          status: "error",
          message: "Username already taken",
        });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid email format",
        });
      }

      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          status: "error",
          message: "Email already registered",
        });
      }
      user.email = email;
    }

    if (bio !== undefined) {
      if (bio.length > 500) {
        return res.status(400).json({
          status: "error",
          message: "Bio must be less than 500 characters",
        });
      }
      user.bio = bio;
    }

    const updatedUser = await user.save();

    res.json({
      status: "success",
      message: "User updated successfully",
      payload: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
      },
    });
  } catch (err) {
    logger.error("Error updating user:", err);
    res.status(500).json({
      status: "error",
      message: "Error updating user",
      error: err.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (err) {
    logger.error("Error deleting user:", err);
    res.status(500).json({
      status: "error",
      message: "Error deleting user",
      error: err.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Both current and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password must be at least 6 characters long",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (err) {
    logger.error("Error changing password:", err);
    res.status(500).json({
      status: "error",
      message: "Error changing password",
      error: err.message,
    });
  }
};
