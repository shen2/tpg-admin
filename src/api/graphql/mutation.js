import fragments  from './fragments'
import gql from 'graphql-tag'

const mutation={
  postCensor:gql`
    mutation postCensor($postId:ObjectId!,$action:ActionEnum!) {
        postCensor(postId:$postId,action:$action){
          ...${fragments.post.name}
        }
    }
    ${fragments.post.value}
  `,
};

export default mutation;
