import { gql } from 'apollo-server-express';

/**
 * View schema
 */
const ViewSchema = gql`
  # --------------------Model Objects------------------------------------

 type View {
   id: String
   post: Post
   createdAt: String
 }

 type ViewPayload {
   id: String
   post: String
   createdAt: String
 }



# ---------------------Query-----------------------------------------------------
extend type Query {
  # Gets view by id
      getView(id: ID!): View
}


  # ----------------Mutations-----------------------------------------
  extend type Mutation {
    #Create View
    createView( postId:ID!): ViewPayload

  }


  # --------------Subscriptions-------------------------------------------
  extend type Subscription {
    #New View
      newView: View
  }

`;
export default ViewSchema;