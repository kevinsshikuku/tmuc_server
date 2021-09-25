import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { ApolloError} from 'apollo-server';

// import { uploadToCloudinary } from '../utils/cloudinary';
import { generateToken } from '../utils/generate-token';

const AUTH_TOKEN_EXPIRY = '1y';



const Query = {
  /**
   * Gets the currently logged in user/authuser
   */
  getAuthUser: async (_, __, { authUser, User }) => {
    if (!authUser) return null;
    // If user is authenticated, update it's isOnline field to true
    const user = await User.findOne( {username: authUser.username})
      .populate({
        path: 'posts',
        populate: [ { path: 'author'} ],
        options: { sort: { createdAt: 'desc' } },
      })
    return user;
  },



  /**
   * Gets user by username
   *
   * @param {string} name
   */
  getUser: async (_, {  username }, { User }) => {
    if (!username) {
      throw new Error('Provide user name.');
    }
    const query = { username: username };
    const user = await User.findOne(query)
      .populate({
        path: 'posts',
        populate: [{ path: 'author' }],
        options: { sort: { createdAt: 'desc' } },
      })


    if (!user) {
      throw new Error("User with given name doesn't exists.");
    }

    return user;
  },



  /**
   * Gets all users
   * @param {int} skip
   * @param {int} limit
   */
  getUsers: async (_, { skip, limit }, { User }) => {

    // Find users that user is not following
    const count = await User.find().countDocuments();
    const users = await User.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 'desc' });

    return { users, count };
  },





  /**
   * Searches users by username or fullName
   *
   * @param {string} searchQuery
   */
  searchUsers: async (_, { searchQuery }, { User, authUser }) => {
    // Return an empty array if searchQuery isn't presented
    if (!searchQuery) {
      return [];
    }

    const users = User.find({
      $or: [
        { name: new RegExp(searchQuery, 'i') }
      ],
      _id: {
        $ne: authUser.id,
      },

    }).limit(50);

    return users;
  },
}




const Mutation = {
/* -------------------------------------------------------------------------- */
  /**
   * Signs in user existing user
   *
   * @param {string} phoneOrname
   * @param {string} password
   */
  signin: async (_, { phoneOrname, password }, { User }) => {
    const user = await User.findOne().or([
      { phonenumber: phoneOrname },
      { username: phoneOrname },
    ]);

    if (!phoneOrUsername) {
      throw new ApolloError('Provide Phone / name to login.')
    }

    if (!user) {
      throw new ApolloError(`( ${phoneOrname} ) has no Account.`)
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new ApolloError('Invalid password.')
    }

    return {
      token: generateToken(user, process.env.SECRET, AUTH_TOKEN_EXPIRY),
    };
  },






/* -------------------------------------------------------------------------- */
  /**
   * Signs up user new user
   *
   * @param {string} phonenumber
   * @param {string} name
   * @param {string} password
   * @param {string} confirmPassword
   */
  signup: async (
    _,
    { phonenumber, name, password , confirmPassword },
    { User }
  ) => {



  // Check if user with given phone number or username already exists
  const user = await User.findOne().or([{ phonenumber }, { name }]);
  console.log(user)
  if (user) {
    const field = user.phonenumber === phonenumber ? phonenumber : name;
    throw new Error(`( ${field} ) is taken.`);
  }

//fields validation
  if ( !name ) {
    throw new ApolloError(
        "Fill name and any other missing fields"
    )
  }

  if(!phonenumber ){
    throw new ApolloError(
        "Fill phone and any other missing fields"
    )
  }

  if(!password ){
    throw new ApolloError(
        "create a password"
    )
  }

  if (!confirmPassword ) {
    throw new ApolloError(
        "confirm your password"
    )
  }
const passwordConfrimation = password === confirmPassword
  if ( !passwordConfrimation) {
    throw new ApolloError(
        `passwords do not match`
    )
  }

   //phone validation
   const phoneRegex = /^(?:0)?((7|1)(?:(?:[1234679][0-9])|(?:0[0-8])|(4[0-1]))[0-9]{6})$/
  if(!phoneRegex.test(phonenumber)){
        throw new ApolloError(
          "Provide correct number. 07..."
        )
  };



    // Username validation
    const usernameRegex = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;
    if (!usernameRegex.test(name)) {
      throw new ApolloError(
        'Usernames can only use letters, numbers, underscores and periods.'
      );
    }
    if (name.length > 8) {
      throw new ApolloError('Username not more than 13 characters.');
    }
    if (name.length < 3) {
      throw new ApolloError('Username min 3 characters.');
    }

    // Password validation
    if (password.length < 6) {
      throw new ApolloError('Password min 6 characters.');
    }

    const newUser = await new User({
      phonenumber,
      name,
      password,
    }).save();

    return {
      token: generateToken(newUser, process.env.SECRET, AUTH_TOKEN_EXPIRY),
    };
  },
};

export default { Query, Mutation };