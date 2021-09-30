import { gql } from 'apollo-server-express';


/**
 * User schema
 */
const UserSchema = gql`

  # -----------------Model Objects----------------------------------------
  type User {
    id: ID!
    name: String!
    username: String
    password: String!
    posts: [Post]
    createdAt: String
    updatedAt: String
  }

  type Token {
    token: String!
  }


  # -------------------Queries--------------------------------------
  extend type Query {

    # Gets the currently logged in user
    getAuthUser: User

    # Gets user by username or by id
    getUser(name: String): User

    # Gets all users
    getUsers( skip: Int, limit: Int): [User]

    # Searches users by username or fullName
    searchUsers(searchQuery: String!): [User]

  }



  # ------------------Mutations---------------------------------------
  extend type Mutation {
    # Signs in user
    signin(
        name: String!
        password: String!
     ): Token

    # Signs up new user
    signup(
        name: String
        password: String
        confirmPassword: String
     ): Token
  }
`;
export default UserSchema;