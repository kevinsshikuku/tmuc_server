import { gql } from 'apollo-server-express';

/**
 * Post schema
 */
const PostSchema = gql`
  # --------------------Model Objects-------------------------------------
  type Post {
    id: ID!
    title: String
    message: String
    image: String
    email:String
    imagePublicId: String
    authorPic: String
    authorName: String
    createdAt: String
    updatedAt: String
  }

  # -----------------Return Payloads----------------------------------------






  # ------------------Queries---------------------------------------
  extend type Query {

    # Gets all posts
    getPosts(skip: Int, limit: Int): [Post]

    # Searches posts by title or description
    searchPosts(searchQuery: String!): [Post]

    # Gets post by id
    getPost(id: ID!): Post
  }


  # ----------------Mutations-----------------------------------------
  extend type Mutation {
    # Creates a new post
      createPost(
            title: String
            message:String
            image: Upload
            email: String
            authorName: String
            authorPic:String
     ): Post

    # Deletes a user post
    deletePost( id: ID! imagePublicId: String ):Post
  }

  # --------------Subscriptions-------------------------------------------
  extend type Subscription {
    # Subscribes to new post event
      newPost: Post
  }

`;
export default PostSchema;