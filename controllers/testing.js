const testingRouter = express('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

testingRouter.post('/reset', async (request, response) => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  response.status(204).end();
});

export default testingRouter;
