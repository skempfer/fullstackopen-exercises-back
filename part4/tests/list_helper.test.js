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
  }
]

test('total likes of two blogs', () => {
  const result = listHelper.totalLikes(blogs)

  expect(result).toBe(12)
})