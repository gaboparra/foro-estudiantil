import Post from "../models/Post.js";
import User from "../models/User.js";
import Forum from "../models/Forum.js";
import logger from "../config/logger.js";

export const createPost = async (req, res) => {
  try {
    const { title, content, author, forum } = req.body;

    if (!title || !content || !author || !forum) {
      return res.status(400).json({
        status: "error",
        message: "Title, content, author and forum are required",
      });
    }

    const existingUser = await User.findById(author);
    if (!existingUser) {
      return res.status(404).json({
        status: "error",
        message: "Author not found",
      });
    }

    const existingForum = await Forum.findById(forum);
    if (!existingForum) {
      return res.status(404).json({
        status: "error",
        message: "Forum not found",
      });
    }

    const newPost = new Post({ title, content, author, forum });
    const savedPost = await newPost.save();

    await User.findByIdAndUpdate(author, { $push: { posts: savedPost._id } });
    await Forum.findByIdAndUpdate(forum, { $push: { posts: savedPost._id } });

    res.status(201).json({
      status: "success",
      message: "Post created successfully",
      payload: {
        _id: savedPost._id,
        title: savedPost.title,
        content: savedPost.content,
        forum: savedPost.forum,
        author: {
          _id: existingUser._id,
          username: existingUser.username,
        },
      },
    });
  } catch (error) {
    logger.error("Error creating post:", error);
    res.status(500).json({
      status: "error",
      message: "Error creating post",
      error: error.message,
    });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username email")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username email" },
      });

    res.json({
      status: "success",
      message: "Posts fetched successfully",
      payload: posts,
    });
  } catch (error) {
    logger.error("Error fetching posts:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching posts",
      error: error.message,
    });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username email")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username email" },
      });

    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    res.json({
      status: "success",
      message: "Post fetched successfully",
      payload: post,
    });
  } catch (error) {
    logger.error("Error fetching post:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching post",
      error: error.message,
    });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title && !content) {
      return res.status(400).json({
        status: "error",
        message: "At least one field (title or content) is required",
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    if (title) post.title = title;
    if (content) post.content = content;

    const updatedPost = await post.save();

    res.json({
      status: "success",
      message: "Post updated successfully",
      payload: updatedPost,
    });
  } catch (error) {
    logger.error("Error updating post:", error);
    res.status(500).json({
      status: "error",
      message: "Error updating post",
      error: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    await User.findByIdAndUpdate(post.author, {
      $pull: { posts: post._id },
    });

    await Forum.findByIdAndUpdate(post.forum, {
      $pull: { posts: post._id },
    });

    await post.deleteOne();

    res.json({
      status: "success",
      message: "Post deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting post:", error);
    res.status(500).json({
      status: "error",
      message: "Error deleting post",
      error: error.message,
    });
  }
};
