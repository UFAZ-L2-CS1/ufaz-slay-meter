// backend/src/models/Vibe.js
import mongoose from "mongoose";

const reactionTypes = ["like", "love", "funny", "sparkle"];

const vibeSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // optional when anonymous
      default: null,
      index: true,
    },
    isAnonymous: { type: Boolean, default: false },
    text: { type: String, required: true, maxlength: 280, trim: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    emojis: [{ type: String }], // e.g. ["✨","🔥"]
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: { type: String, enum: reactionTypes },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

vibeSchema.index({ recipientId: 1, createdAt: -1 });

export const REACTION_TYPES = reactionTypes;
const Vibe = mongoose.model("Vibe", vibeSchema);
export default Vibe;
