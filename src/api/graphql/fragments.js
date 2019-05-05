const fragments = {
  post: {
    name: 'postFields',
    value: `
      fragment postFields on Post {
        id
        slug
        status
        title
        content
        tags
        censoring
        pendingCategories
        categories
        photoList{
          id
          url
          status
        } 
      } 
    `
  }
}

export default fragments
