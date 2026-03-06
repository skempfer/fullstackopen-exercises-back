const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const mostBlogs = (blogs) => {

  const count = {}

  blogs.forEach(blog => {
    count[blog.author] = (count[blog.author] || 0) + 1
  })

  let topAuthor = null
  let maxBlogs = 0

  for (const author in count) {
    if (count[author] > maxBlogs) {
      maxBlogs = count[author]
      topAuthor = author
    }
  }

  return {
    author: topAuthor,
    blogs: maxBlogs
  }
}

const mostLikes = (blogs) => {
  const likeCount = {}

  blogs.forEach(blog => {
    likeCount[blog.author] =
      (likeCount[blog.author] || 0) + blog.likes
  })

  let maxAuthor = null
  let maxLikes = 0

  for (const author in likeCount) {
    if (likeCount[author] > maxLikes) {
      maxLikes = likeCount[author]
      maxAuthor = author
    }
  }

  return {
    author: maxAuthor,
    likes: maxLikes
  }
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  const favorite = blogs.reduce((favorite, blog) => {
    return blog.likes > favorite.likes ? blog : favorite
  })

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}