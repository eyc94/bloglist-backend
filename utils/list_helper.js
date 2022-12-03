const _ = require('lodash');

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  let likesSum = 0;
  for (let i = 0; i < blogs.length; i++) {
    likesSum += blogs[i].likes;
  }
  return likesSum;
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }
  let favoriteBlog = {};
  let mostLikesSoFar = 0;
  for (let i = 0; i < blogs.length; i++) {
    let currentBlogLikes = blogs[i].likes;
    if (currentBlogLikes > mostLikesSoFar) {
      mostLikesSoFar = currentBlogLikes;
      favoriteBlog = blogs[i];
    }
  }
  const condensedBlog = {};
  condensedBlog.title = favoriteBlog.title;
  condensedBlog.author = favoriteBlog.author;
  condensedBlog.likes = favoriteBlog.likes;
  return condensedBlog;
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }
  const result = {};
  const authorBlogCount = _.countBy(blogs, (blog) => blog.author);
  
  let authorWithMostBlogs;
  let mostBlogs = 0;
  for (const [key, value] of Object.entries(authorBlogCount)) {
    if (value > mostBlogs) {
      mostBlogs = value;
      authorWithMostBlogs = key;
    }
  }

  result.author = authorWithMostBlogs;
  result.blogs = mostBlogs;
  return result;
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }
  const blogsGroupedByAuthor = _.groupBy(blogs, 'author');
  const listOfAuthorsWithSummedLikes = _.map(blogsGroupedByAuthor, (objs, key) => ({
    'author': key,
    'likes': _.sumBy(objs, 'likes')
  }));
  const authorWithMostTotalLikes = _.maxBy(listOfAuthorsWithSummedLikes, (author) => author.likes);
  return authorWithMostTotalLikes;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
