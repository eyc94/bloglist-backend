const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const body = request.body;

  if (!body.title) {
    return response.status(400).json({
      error: 'Missing title'
    });
  }

  if (!body.url) {
    return response.status(400).json({
      error: 'Missing url'
    });
  }

  const user = await User.findById('638e8d02361e67acac4c3b7a');

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body;

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };

  const updatedNote = await Blog.findByIdAndUpdate(
    request.params.id, blog, { new: true }
  );
  response.json(updatedNote);
});

module.exports = blogsRouter;
