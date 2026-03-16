const listHelper = require('../utils/list_helper')

const blogs = [
  {
    _id: "1",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7
  },
  {
    _id: "2",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://example.com",
    likes: 5
  },
  {
    _id: "3",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://example.com",
    likes: 12
  }
]
describe('favorite blog', () => {

  test('blog with most likes is returned', () => {
    const result = listHelper.favoriteBlog(blogs)

    expect(result).toEqual({
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      likes: 12
    })
  })

})

describe('most blogs', () => {

  test('author with most blogs', () => {
    const result = listHelper.mostBlogs(blogs)

    expect(result).toEqual({
      author: "Edsger W. Dijkstra",
      blogs: 2
    })
  })

})

describe('most likes', () => {
    
  test('author with most likes', () => {
    const result = listHelper.mostLikes(blogs)

    expect(result).toEqual({
      author: "Edsger W. Dijkstra",
      likes: 17
    })
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
