import { ApolloError} from 'apollo-server';
const ShortUniqueId = require('short-unique-id');



const Query = {

  /**
   * Gets gamer by username
   *
   * @param {string} name
   */
  getGamer: async (_, { username }, { Gamer }) => {

    const query = { username: username };
    const gamer = await Gamer.findOne(query)

    if (!gamer) {
      throw new Error("Gamer with given name doesn't exists.");
    }

    return gamer;
  },



  /**
   * Gets all gamers
   * @param {int} skip
   * @param {int} limit
   */
  getGamers: async (_, { skip, limit }, { Gamer }) => {
    const gamers = await Gamer.find({flips : { $ne: null} })
      .skip(skip)
      .limit(limit)
      .sort({ flips: 1 });

    return gamers;
  },


}




const Mutation = {
/* -------------------------------------------------------------------------- */
  /**
   * Signs in  existing gamer
   *
   * @param {string} name
   */
  gamerSignin: async (_, { name }, { Gamer }) => {

    if (!name) {
      throw new ApolloError(' gamer name is needed to Login.')
    }


  const uid = await new ShortUniqueId({ length: 10 });
  const username = name.concat("-",uid())
  const name_ = username.slice(0, -11)

  //If user dont exist go ahead and save
  const newGamer = await new Gamer({
        name: name_,
        username
      }).save();

    return newGamer;
  },


/**
 * Save user score and flips
 */

  saveGamerScores: async(_, { score, flips_, username}, { Gamer}) => {
     const flips = parseInt(flips_)

    //FInd gamer and update
    const gamer = await Gamer.findOneAndUpdate(
      { username: username },
      {$set: { flips: flips, score: score} }
    );
    return gamer
  },



/**
 *
 * @param {name} string
 */
  deleteGamer: async (_, { name}, { Gamer}) => {
      const gamer = await Gamer.findOneAndRemove(name);
      return gamer
  },



/**
 *
 * @param {name} string
 */
  deleteGamers: async (_, __, { Gamer}) => {
      await Gamer.deleteMany();
      return true
  }

};

export default { Query, Mutation };