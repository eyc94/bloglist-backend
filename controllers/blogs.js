const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const body = request.body;
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({
      error: 'token missing or invalid'
    });
  }

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

  const user = await User.findById(decodedToken.id);

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
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({
      error: 'token missing or invalid'
    });
  }

  const blog = await Blog.findById(request.params.id);
  const user = await User.findById(decodedToken.id);

  if (blog.user.toString() === user._id.toString()) {
    await Blog.findByIdAndRemove(request.params.id);
    user.blogs.filter(b => b.toString() !== blog._id.toString());
    await user.save();
    return response.status(204).end();
  } else {
    return response.status(401).json({
      error: 'unauthorized attempt to delete'
    });
  }
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
