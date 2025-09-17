import mongoose from "mongoose";

const forumSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    // isPremium: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Forum", forumSchema);
