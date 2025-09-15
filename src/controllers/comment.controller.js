import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

export const createComment = async (req, res) => {
  try {
    const { content, author } = req.body;
    const { postId } = req.params;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const existingPost = await Post.findById(postId);
    if (!existingPost)
      return res.status(404).json({ message: "Post not found" });

    const existingUser = await User.findById(author);
    if (!existingUser) {
      return res.status(404).json({ message: "Author not found" });
    }

    const newComment = new Comment({ content, author, post: postId });
    const savedComment = await newComment.save();

    await Post.findByIdAndUpdate(postId, {
      $push: { comments: savedComment._id },
    });

    res.status(201).json(savedComment);
  } catch (error) {
    res.status(500).json({ message: "Error creating comment", error });
  }
};

export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId }).populate(
      "author",
      "username email"
    );
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error });
  }
};

export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (!req.body.content || !req.body.content.trim()) {
      return res.status(400).json({ message: "Comment content cannot be empty" });
    }

    comment.content = req.body.content.trim();
    const updatedComment = await comment.save();

    res.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Error updating comment", error });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    });

    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error });
  }
};
