import { gql } from 'apollo-server-express';

import PostSchema from './Post';
import UserSchema from './User';

const schema = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  type Subscription {
    _empty: String
  }

  ${PostSchema}
  ${UserSchema}
`;
export default schema;