import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const Schema = mongoose.Schema;

/**
 * User schema that has references to Post, Like,Rating, Comment, Follow and Notification schemas
 */
const userSchema = new Schema(
  {
    phonenumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      lowercase: true,
    },
    passwordResetToken: String,
    passwordResetTokenExpiry: Date,
    password: {
      type: String,
      required: true,
    },
    image: String,
    imagePublicId: String,
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
  },
  {
    timestamps: true,
  }
);

/**
 * Hashes the users password when saving it to DB
 */
userSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);

      this.password = hash;
      next();
    });
  });
});

export default mongoose.model('User', userSchema);
