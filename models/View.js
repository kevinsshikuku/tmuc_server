import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * Post schema that has references to User, Like and Comment schemas
 */
const viewSchema = Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref:"Post"
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('View', viewSchema);
