import Forum from "../models/Forum.js";
import User from "../models/User.js";

export const createForum = async (req, res) => {
  try {
    const { name, description, isPremium } = req.body;

    const existingForum = await Forum.findOne({ name });
    if (existingForum) {
      return res.status(400).json({ message: "Forum name already exists" });
    }

    const newForum = new Forum({ name, description, isPremium });
    const savedForum = await newForum.save();

    res.status(201).json(savedForum);
  } catch (error) {
    res.status(500).json({ message: "Error creating forum", error });
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

    res.json(forums);
  } catch (error) {
    res.status(500).json({ message: "Error fetching forums", error });
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

    if (!forum) return res.status(404).json({ message: "Forum not found" });

    res.json(forum);
  } catch (error) {
    res.status(500).json({ message: "Error fetching forum", error });
  }
};

export const joinForum = async (req, res) => {
  try {
    const { userId } = req.body;

    const forum = await Forum.findById(req.params.id);
    if (!forum) return res.status(404).json({ message: "Forum not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (forum.members.includes(userId)) {
      return res.status(400).json({ message: "User already joined this forum" });
    }

    forum.members.push(userId);
    await forum.save();

    user.forums.push(forum._id);
    await user.save();

    res.json({
      message: "Joined forum successfully",
      forum: {
        _id: forum._id,
        name: forum.name,
        description: forum.description,
        membersCount: forum.members.length,
      },
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        forums: user.forums,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error joining forum", error });
  }
};

export const leaveForum = async (req, res) => {
  try {
    const { userId } = req.body;

    const forum = await Forum.findById(req.params.id);
    if (!forum) return res.status(404).json({ message: "Forum not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    forum.members = forum.members.filter((id) => id.toString() !== userId);
    await forum.save();

    user.forums = user.forums.filter(
      (forumId) => forumId.toString() !== forum._id.toString()
    );
    await user.save();

    res.json({
      message: "Left forum successfully",
      forum: {
        _id: forum._id,
        name: forum.name,
        membersCount: forum.members.length,
      },
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        forums: user.forums,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error leaving forum", error });
  }
};

export const deleteForum = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id);
    if (!forum) return res.status(404).json({ message: "Forum not found" });

    await forum.deleteOne();
    res.json({ message: "Forum deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting forum", error });
  }
};
