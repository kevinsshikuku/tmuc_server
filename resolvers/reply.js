const { UserInputError } = require('apollo-server');

const Mutation = {
  /* ---------------------create post----------------------------------------------------- */
  /**
   * Creates a new post
   * @param {string} body
   * @param { ID } postId
   */

  createReply: async (
    _,
    {  body, postId }, { Post, Reply }) => {

    if (!body) {
       throw new UserInputError('Can post a blank reply');
    }

    const newReply = await new Reply({
      body,
      post: postId
    }).save();



// find a user from model and update post field
    await Post.findOneAndUpdate(
      { _id: postId },
      { $push: { replies: newReply.id } }
    );

    return newReply;
  },

};

export default { Mutation };
