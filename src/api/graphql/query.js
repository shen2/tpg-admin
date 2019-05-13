import fragments  from './fragments'
import gql from 'graphql-tag'

const query = {
  site:gql`
    query site($id:Int!){
      site(id:$id){
          id
          title
          categoryList{
            id
            name
            slug
          }
        }
      }
  `,
  postAdmin:gql`
    query postsAdmin($filter:String,$tag:String,$offset:Int,$size:Int){
       postsAdmin(filter:$filter,tag:$tag,offset:$offset,size:$size){
         ...${fragments.post.name}
       }
    }
    ${fragments.post.value}
  `,
  users:gql`
     query users($offset:Int,$size:Int){
       users(offset:$offset,size:$size){
          id
          slug
          name
          avatar
          url
          mobile
          createdAt
          reviewCategories
       }
     }
   `,
  comments:gql`
    query post{
      post(id:"5cd16b1fe9cff83bf4552901"){
        commentList(offset:0){
          id
          status
          content
          createdAt
          author{
            id
            name
            avatar
          }
        }
      }
    }
  `,
}

export default query
