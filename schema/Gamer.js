import { gql } from 'apollo-server-express';


/**
 * Gamer schema
 */
const GamerSchema = gql`

  # -----------------Model Objects----------------------------------------
  type Gamer {
    id: ID!
    name: String
    username: String
    flips: Int
    score:String
    createdAt: String
  }



  # -------------------Queries--------------------------------------
  extend type Query {

    # Gets user by username or by id
    getGamer(name: String): Gamer

    # Gets all users
    getGamers( skip: Int, limit: Int): [Gamer]

  }



  # ------------------Mutations---------------------------------------
  extend type Mutation {
    # Signs in user
    gamerSignin(
        name: String
     ): Gamer

   # Save score
    saveGamerScores(
        score: String,
        flips_: String,
        username:  String
        ): Gamer

    #Delete gamer
    deleteGamer(name: String): Gamer
    deleteGamers: Boolean
  }


`;
export default GamerSchema;