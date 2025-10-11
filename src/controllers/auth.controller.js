import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import logger from "../config/logger.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid email format",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email already registered",
      });
    }

    const user = await User.create({ username, email, password });

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      payload: {
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    logger.error("Error registering user:", err);
    return res.status(500).json({
      status: "error",
      message: "Error registering user",
      error: err.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);

    return res.json({
      status: "success",
      message: "Login successful",
      payload: {
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
      },
    });
  } catch (err) {
    logger.error("Error logging in:", err);
    return res.status(500).json({
      status: "error",
      message: "Error logging in",
      error: err.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword, confirmPassword } = req.body;

    if (!email || !currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "error",
        message:
          "Email, current password, new password and confirmation are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "error",
        message: "Passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password must be at least 6 characters long",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
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

export const logout = async (req, res) => {
  try {
    res.json({
      status: "success",
      message: "User logged out successfully",
    });
  } catch (err) {
    logger.error("Error logging out:", err);
    res.status(500).json({
      status: "error",
      message: "Error logging out",
      error: err.message,
    });
  }
};
