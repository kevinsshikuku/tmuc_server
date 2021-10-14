import { gql } from 'apollo-server-express';

/**
 * Post schema
 */
const ReplySchema = gql`
  # --------------------Model Objects-------------------------------------
  type Reply {
    id: ID!
    body: String
    createdAt: String
  }

type ReplyPayload {
  count: Int
  replies: [Reply]
}

  # ------------------Queries---------------------------------------
  extend type Query {

    # Gets all posts
    getReply(id:ID): Reply


    # Gets post by id
    getPostReplies(postId: ID!): [ReplyPayload]
  }





  # ----------------Mutations-----------------------------------------
  extend type Mutation {
    # Creates a new post
      createReply(
            body:String
            postId:String
     ): Reply



  }



  # --------------Subscriptions-------------------------------------------
  extend type Subscription {
    # Subscribes to new post event
      newReply: Reply
  }

`;
export default ReplySchema;