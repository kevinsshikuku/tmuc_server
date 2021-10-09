import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * Post schema that has references to User, Like and Comment schemas
 */
const postSchema = Schema(
  {
    message: String,
    title: String,
    image: String,
    imagePublicId: String,
    views: [{
      type: Schema.Types.ObjectId,
      ref:"View"
    }],
    name:String,
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Post', postSchema);
