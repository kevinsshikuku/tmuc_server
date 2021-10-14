import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * Post schema that has references to User, Like and Comment schemas
 */
const replySchema = Schema(
  {
    body: String,
    post: {
      type: Schema.Types.ObjectId,
      ref:"Post"
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Reply', replySchema);
