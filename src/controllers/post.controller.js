import Post from "../models/Post.js";
import User from "../models/User.js";
import Forum from "../models/Forum.js";

export const createPost = async (req, res) => {
  try {
    const { title, content, author, forum } = req.body;

    if (!title || !content || !author || !forum) {
      return res.status(400).json({ message: "Title, content, author and forum are required" });
    }

    const existingUser = await User.findById(author);
    if (!existingUser) {
      return res.status(404).json({ message: "Author not found" });
    }

    const existingForum = await Forum.findById(forum);
    if (!existingForum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    const newPost = new Post({ title, content, author, forum });
    const savedPost = await newPost.save();

    await User.findByIdAndUpdate(author, { $push: { posts: savedPost._id } });
    await Forum.findByIdAndUpdate(forum, { $push: { posts: savedPost._id } });

    res.status(201).json({
      message: "Post created successfully",
      post: {
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
    res.status(500).json({ message: "Error creating post", error });
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

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error });
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

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Error fetching post", error });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (title) post.title = title;
    if (content) post.content = content;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error updating post", error });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    await User.findByIdAndUpdate(post.author, {
      $pull: { posts: post._id },
    });

    await Forum.findByIdAndUpdate(post.forum, {
      $pull: { posts: post._id },
    });

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error });
  }
};
