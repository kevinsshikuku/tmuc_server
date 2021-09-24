import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * Post schema that has references to User, Like and Comment schemas
 */
const postSchema = Schema(
  {
    message: String,
    title: String,
    authorName: String,
    authorPic: String,
    email: String,
    image: String,
    imagePublicId:String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Post', postSchema);
