import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * User schema that has references to Post, Like,Rating, Comment, Follow and Notification schemas
 */
const gamerSchema = new Schema(
  { username: {
      type: String,
      unique: true,
      required: true,
    },
    name: String,
    score: String,
    flips: Number
  },
  {
    timestamps: true,
  }
);


export default mongoose.model('Gamer', gamerSchema);