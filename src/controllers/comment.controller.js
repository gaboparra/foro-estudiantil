import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

export const createComment = async (req, res) => {
  try {
    const { content, author } = req.body;
    const { postId } = req.params;

    if (!content || !content.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Comment content is required",
      });
    }

    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    const existingUser = await User.findById(author);
    if (!existingUser) {
      return res.status(404).json({
        status: "error",
        message: "Author not found",
      });
    }

    const newComment = new Comment({
      content: content.trim(),
      author,
      post: postId,
    });
    const savedComment = await newComment.save();

    await Post.findByIdAndUpdate(postId, {
      $push: { comments: savedComment._id },
    });

    res.status(201).json({
      status: "success",
      message: "Comment created successfully",
      payload: {
        _id: savedComment._id,
        content: savedComment.content,
        post: savedComment.post,
        author: {
          _id: existingUser._id,
          username: existingUser.username,
          email: existingUser.email,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error creating comment",
      error: error.message,
    });
  }
};

export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId }).populate(
      "author",
      "username email"
    );

    res.json({
      status: "success",
      message: "Comments fetched successfully",
      payload: comments,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching comments",
      error: error.message,
    });
  }
};

export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({
        status: "error",
        message: "Comment not found",
      });
    }

    if (!req.body.content || !req.body.content.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Comment content cannot be empty",
      });
    }

    comment.content = req.body.content.trim();
    const updatedComment = await comment.save();

    res.json({
      status: "success",
      message: "Comment updated successfully",
      payload: updatedComment,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating comment",
      error: error.message,
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({
        status: "error",
        message: "Comment not found",
      });
    }

    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    });

    await comment.deleteOne();

    res.json({
      status: "success",
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error deleting comment",
      error: error.message,
    });
  }
};
