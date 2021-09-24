import { deleteFromCloudinary, upLoadResponse } from '../utils/cloudinary';
import { pubSub } from '../utils/apollo-server';
import {  NEW_POST } from '../constants/Subscriptions';
const { UserInputError } = require('apollo-server');


const Query = {
  /**
   * Gets all posts
   * @param {int} skip how many posts to skip
   * @param {int} limit how many posts to limit
   */
  getPosts: async (_, { skip, limit }, { Post }) => {
    const allPosts = await Post.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 'desc' });

    return allPosts ;
  },


 /* -------------------------------------------------------------------------- */
 /**
   * Searches posts by search query
   *
   * @param {string} searchQuery
   */
  searchPosts: async (_, { searchQuery }, { Post, authUser }) => {
    // Return an empty array if searchQuery isn't presented
    if (!searchQuery) {
      return [];
    }

    const posts = Post.find({
      $or: [
        { title: new RegExp(searchQuery, 'i') },
        { price: new RegExp(searchQuery, 'i') },
        { description: new RegExp(searchQuery, 'i') },
      ],

      _id: {
        $ne: authUser.id,
      },
    }).limit(50);

    return posts;
  },
/* -------------------------------------------------------------------------- */




  /**
   *
   *Gets post by id
   * @param {string} id
   */
  getPost: async (_, { id }, { Post }) => {
    const post = await Post.findById(id)
    return post;
  },
};



const Mutation = {
  /* -------------------------------------------------------------------------- */
  /**
   * Creates a new post
   * @param {string} title
   * @param {string} message
   * @param {string} image
   * @param {string} authorPic
   * @param {string} authorName
   */
  createPost: async (
    _,
    {  title, message, image,email, authorPic, authorName }, { Post }) => {
    if (!title) {
       throw new UserInputError('Give a Title of your Notice');
    }else if(!message){
       throw new UserInputError('Give Discription of your Notice');
    }

//image upload logic
    let imageUrl, imagePublicId;
    if (image) {
        const imageResults = await upLoadResponse(image)
        imagePublicId = imageResults.public_id;
        imageUrl = imageResults.secure_url;
    }

    const newPost = await new Post({
      title,
      message,
      authorName,
      authorPic,
      image: imageUrl,
      imagePublicId,
      email
    }).save();

    pubSub.publish(NEW_POST, {
          newPost: newPost
        })

    return newPost;
  },



/* -----------------------------deletePost--------------------------------------------- */
  /**
   * Deletes a user post
   * @param {string} id
   * @param {imagePublicId} id
   */
  deletePost: async (_,{ id, imagePublicId },{ Post, Like, User, Comment, Notification }) => {
    // Remove post image from cloudinary, if imagePublicId is present
    if (imagePublicId) {
      const deleteImage = await deleteFromCloudinary(imagePublicId);

      if (deleteImage.result !== 'ok') {
        throw new Error(
          'Something went wrong while deleting item from Cloudinary'
        );
      }
    }

// Find post and remove it
 const post = await Post.findByIdAndRemove(id);
    // Delete post from authors (users) posts collection
    await User.findOneAndUpdate(
      { _id: post.author},
      { $pull: { posts: post.id } }
    );


// Delete post likes from likes collection
    await Like.find({ post: post.id }).deleteMany();
    // Delete post likes from users collection
    post.likes.map(async likeId => {
      await User.where({ likes: likeId }).updateMany({ $pull: { likes: likeId } });
    });


// Delete post comments from comments collection
    await Comment.find({ post: post.id }).deleteMany();
    // Delete comments from users collection
    post.comments.map(async commentId => {
      await User.where({ comments: commentId }).updateMany({
        $pull: { comments: commentId },
      });
    });


    // Find user notification in users collection and remove them
    const userNotifications = await Notification.find({ post: post.id });

    userNotifications.map(async notification => {
      await User.where({ notifications: notification.id }).update({
        $pull: { notifications: notification.id },
      });
    });
    // Remove notifications from notifications collection
    await Notification.find({ post: post.id }).deleteMany();

    return post;
  },
};


/* -------------------------------------------------------------------------- */
/**
 * Subscribes to new post event
 */
const Subscription = {
  newPost : {
    // subscribe: ()  => pubSub.asyncIterator("NEW_POST"),
    subscribe: () => pubSub.asyncIterator("NEW_POST")
  }

};

export default { Query, Mutation, Subscription };
