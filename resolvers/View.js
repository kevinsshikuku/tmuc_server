import { pubSub } from '../utils/apollo-server';
import { NEW_VIEW } from '../constants/Subscriptions';
const { UserInputError } = require('apollo-server');


const Query = {

    /**
     *
     *Gets post by id
    * @param {string} id
    */
    getView: async (_, { id }, { View }) => {
      const view = await View.findById(id)
      .populate({ path: "post" })
      console.log(view)
      return view;
    },
  };


const Mutation = {

/* -------------------------------Create View------------------------------------------- */
/**
 * @param {String} postId
 */
 createView: async(_,{ postId },{ Post, View }) => {
    if (!postId) {
       throw new UserInputError('No or invalid ID');
    }

    const newView = await new View({
       post : postId
    }).save();

// find a user from model and update post field
 await Post.findOneAndUpdate(
      { _id: postId },
      { $push: { views: newView.id } }
    );

   pubSub.publish(NEW_VIEW, {
          newView
        });

   return newView;
 },


};


/* -------------------------------------------------------------------------- */
/**
 * Subscribes to new post event
 */
const Subscription = {
  newView : {
    subscribe: () => pubSub.asyncIterator("NEW_VIEW")
  }

};

export default {Query, Mutation, Subscription };