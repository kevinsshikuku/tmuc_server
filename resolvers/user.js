import bcrypt from 'bcryptjs';
import { ApolloError} from 'apollo-server';

// import { uploadToCloudinary } from '../utils/cloudinary';
import { generateToken } from '../utils/generate-token';

const AUTH_TOKEN_EXPIRY = '1460d';



const Query = {
  /**
   * Gets the currently logged in user/authuser
   */
  getAuthUser: async ( _, __, { authUser, User }) => {
    if (!authUser) return null;
    // If user is authenticated, update it's isOnline field to true
    const user = await User.findById(authUser.id)
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
  getUser: async (_, {  name }, { User }) => {

    const username = name.replace(/\s/g, "").toLowerCase();
    if (!name) {
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
    const users = await User.find()
    .populate({
        path: 'posts',
        populate: [{ path: 'author' }],
        options: { sort: { createdAt: 'desc' } },
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 'desc' });

    return users;
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
        { name: new RegExp(searchQuery, 'i') },
        { username: new RegExp(searchQuery, 'i') }
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
   * Signs in user existing user * Rarely acceced due to incompatibilitie
   *
   * @param {string} name
   * @param {string} password
   */
  signin: async (_, { name, password }, { User }) => {

   const username = name.replace(/\s/g, "").toLowerCase();

    const user = await User.findOne().or([ { username } ]);

    if (!name) {
      throw new ApolloError('name / title is needed to Login.')
    }

    if (!user) {
      throw new ApolloError(`name ${name}  has no account.`)
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new ApolloError('password is invalid.')
    }


    return {
      token: generateToken(user, process.env.SECRET, AUTH_TOKEN_EXPIRY),
    };
  },






/* -------------------------------------------------------------------------- */
  /**
   * Signs up user new user
   * @param {string} name
   * @param {string} password
   * @param {string} confirmPassword
   */
 signup: async (_,{ name, password , confirmPassword },{ User }) => {


//fields validation
  if ( !name || name === '') {
    throw new ApolloError(
        "name is not provided"
    )
  }

  if(!password || password === '' ){
    throw new ApolloError(
        "password is not provided"
    )
  }

  if (!confirmPassword || confirmPassword === '') {
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


// Username validation
    if (name.length > 20) {
      throw new ApolloError('name should not more than 20 characters.');
    }
    if (name.length < 3) {
      throw new ApolloError('name min 3 characters.');
    }

// Password validation
    if (password.length < 6) {
      throw new ApolloError('password min 6 characters.');
    }

// Check if user with given  username already exists
  const username = name.replace(/\s/g, "").toLowerCase();

 const user = await User.findOne().or([{ username }]);
  if(user){
      throw new Error(`name ${name}  is taken.`)
   }

//If user dont exist go ahead and save
 const newUser = await new User({
      name,
      username,
      password,
    }).save();

    return {
      token: generateToken(newUser, process.env.SECRET, AUTH_TOKEN_EXPIRY),
    };
  },
};

export default { Query, Mutation };