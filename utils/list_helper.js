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

module.exports = {
  dummy,
  totalLikes,
};
