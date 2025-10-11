import Forum from "../models/Forum.js";
import User from "../models/User.js";
import logger from "../config/logger.js";

export const createForum = async (req, res) => {
  try {
    const { name, description, isPremium } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        status: "error",
        message: "Name and description are required",
      });
    }

    const existingForum = await Forum.findOne({ name });
    if (existingForum) {
      return res.status(400).json({
        status: "error",
        message: "Forum name already exists",
      });
    }

    const newForum = new Forum({
      name,
      description,
      isPremium: isPremium || false,
    });
    const savedForum = await newForum.save();

    res.status(201).json({
      status: "success",
      message: "Forum created successfully",
      payload: savedForum,
    });
  } catch (error) {
    logger.error("Error creating forum:", error);
    res.status(500).json({
      status: "error",
      message: "Error creating forum",
      error: error.message,
    });
  }
};

export const getForums = async (req, res) => {
  try {
    const forums = await Forum.find().populate({
      path: "posts",
      select: "title content author",
      populate: {
        path: "author",
        select: "username email",
      },
    });

    res.json({
      status: "success",
      message: "Forums fetched successfully",
      payload: forums,
    });
  } catch (error) {
    logger.error("Error fetching forums:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching forums",
      error: error.message,
    });
  }
};

export const getForumById = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id)
      .populate("members", "username email")
      .populate({
        path: "posts",
        populate: [
          {
            path: "author",
            select: "username email",
          },
          {
            path: "comments",
            populate: {
              path: "author",
              select: "username email",
            },
          },
        ],
      });

    if (!forum) {
      return res.status(404).json({
        status: "error",
        message: "Forum not found",
      });
    }

    res.json({
      status: "success",
      message: "Forum fetched successfully",
      payload: forum,
    });
  } catch (error) {
    logger.error("Error fetching forum:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching forum",
      error: error.message,
    });
  }
};

export const joinForum = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    const forum = await Forum.findById(req.params.id);
    if (!forum) {
      return res.status(404).json({
        status: "error",
        message: "Forum not found",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (forum.members.includes(userId)) {
      return res.status(400).json({
        status: "error",
        message: "User already joined this forum",
      });
    }

    forum.members.push(userId);
    await forum.save();

    user.forums.push(forum._id);
    await user.save();

    res.json({
      status: "success",
      message: "Joined forum successfully",
      payload: {
        forum: {
          _id: forum._id,
          name: forum.name,
          description: forum.description,
          isPremium: forum.isPremium,
          membersCount: forum.members.length,
        },
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          forums: user.forums,
        },
      },
    });
  } catch (error) {
    logger.error("Error joining forum:", error);
    res.status(500).json({
      status: "error",
      message: "Error joining forum",
      error: error.message,
    });
  }
};

export const leaveForum = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    const forum = await Forum.findById(req.params.id);
    if (!forum) {
      return res.status(404).json({
        status: "error",
        message: "Forum not found",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    forum.members = forum.members.filter((id) => id.toString() !== userId);
    await forum.save();

    user.forums = user.forums.filter(
      (forumId) => forumId.toString() !== forum._id.toString()
    );
    await user.save();

    res.json({
      status: "success",
      message: "Left forum successfully",
      payload: {
        forum: {
          _id: forum._id,
          name: forum.name,
          // description: forum.description,
          isPremium: forum.isPremium,
          membersCount: forum.members.length,
        },
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          forums: user.forums,
        },
      },
    });
  } catch (error) {
    logger.error("Error leaving forum:", error);
    res.status(500).json({
      status: "error",
      message: "Error leaving forum",
      error: error.message,
    });
  }
};

export const deleteForum = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id);
    if (!forum) {
      return res.status(404).json({
        status: "error",
        message: "Forum not found",
      });
    }

    await User.updateMany(
      { forums: forum._id },
      { $pull: { forums: forum._id } }
    );

    await forum.deleteOne();

    res.json({
      status: "success",
      message: "Forum deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting forum:", error);
    res.status(500).json({
      status: "error",
      message: "Error deleting forum",
      error: error.message,
    });
  }
};
