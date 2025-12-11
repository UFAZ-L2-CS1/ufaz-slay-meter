// backend/src/models/War.js
import mongoose from "mongoose";

const warSchema = new mongoose.Schema(
  {
    // İki mübarizəçi - hər biri bir vibe ilə
    contestant1: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      vibeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vibe",
        required: true,
      },
      votes: { type: Number, default: 0 },
    },
    contestant2: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      vibeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vibe",
        required: true,
      },
      votes: { type: Number, default: 0 },
    },
    
    // War schedule
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    
    // War status
    status: {
      type: String,
      enum: ["scheduled", "active", "ended"],
      default: "scheduled",
    },
    
    // Votes tracking - kim kimə vote verib
    votes: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        contestantNumber: {
          type: Number,
          enum: [1, 2],
          required: true,
        },
        votedAt: { type: Date, default: Date.now },
      },
    ],
    
    // Winner (war bitdikdən sonra)
    winner: {
      type: Number,
      enum: [1, 2, null],
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes
warSchema.index({ startTime: 1, status: 1 });
warSchema.index({ "votes.userId": 1 });

// Method: Check if user has voted
warSchema.methods.hasUserVoted = function (userId) {
  return this.votes.some((v) => String(v.userId) === String(userId));
};

// Method: Get user's vote
warSchema.methods.getUserVote = function (userId) {
  return this.votes.find((v) => String(v.userId) === String(userId));
};

// Method: Calculate winner
warSchema.methods.calculateWinner = function () {
  if (this.contestant1.votes > this.contestant2.votes) {
    this.winner = 1;
  } else if (this.contestant2.votes > this.contestant1.votes) {
    this.winner = 2;
  } else {
    this.winner = null; // tie
  }
  return this.winner;
};

const War = mongoose.model("War", warSchema);
export default War;
