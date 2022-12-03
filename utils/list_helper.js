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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
