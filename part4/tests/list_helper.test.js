const listHelper = require('../utils/list_helper')

const blogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    likes: 7
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger Dijkstra",
    likes: 5
  },
  {
    title: "Canonical string reduction",
    author: "Edsger Dijkstra",
    likes: 12
  }
]

test('author with most blogs', () => {
  const result = listHelper.mostBlogs(blogs)

  expect(result).toEqual({
    author: "Edsger Dijkstra",
    blogs: 2
  })
})

test('favorite blog', () => {
  const result = listHelper.favoriteBlog(blogs)

  expect(result.title).toBe("Canonical string reduction")
})

test('total likes of all blogs', () => {
  const result = listHelper.totalLikes(blogs)

  expect(result).toBe(24)
})