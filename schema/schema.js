import { gql } from 'apollo-server-express';

import PostSchema from './Post';
import UserSchema from './User';
import ViewSchema from './View';
import ReplySchema from "./Reply";
import GamerSchema from './Gamer';

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
  ${ViewSchema}
  ${ReplySchema}
  ${GamerSchema}
`;
export default schema;