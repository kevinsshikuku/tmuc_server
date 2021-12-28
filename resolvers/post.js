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
      .populate( {path: "views"})
      .populate( {path: "author"})
      .populate( {
        path: "replies",
        options: { sort: { createdAt: 'desc' } },
        })
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
    .populate({path: "author"})
    .populate( {path: "views"})
    .populate( {
      path: "replies",
      options: { sort: { createdAt: 'desc' } },
      })
    return post;
  },
};



const Mutation = {
  /* ---------------------create post----------------------------------------------------- */
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
    {  title, message, authorId, name, image }, { Post, User }) => {

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
      name,
      author:authorId,
      image: imageUrl,
      imagePublicId,
    }).save();



// find a user from model and update post field
    await User.findOneAndUpdate(
      { _id: authorId },
      { $push: { posts: newPost.id } }
    );

// post to be return after mutation
  const post = await Post.findById(newPost.id)
        .populate({path:"author"})
        .populate({path:"views"})
        .populate({path:"replies"});


   pubSub.publish(NEW_POST, {
          newPost: post
        })

    return post;
  },


/* -----------------------------deletePost--------------------------------------------- */
  /**
   * Deletes a user post
   * @param {string} id
   * @param {imagePublicId} id
   */
  deletePost: async (_,{ id, authUserId, imagePublicId },{ Post, User , Reply}) => {

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

//Delet post replies
    await Reply.deleteMany({post: post.id})

// Delete post from authors (users) posts collection
    await User.findOneAndUpdate(
      { _id: authUserId},
      { $pull: { posts: post.id } }
    );

    return true;
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