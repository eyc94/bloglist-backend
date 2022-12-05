const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObject = new Blog(helper.initialBlogs[0]);
  await blogObject.save();
  blogObject = new Blog(helper.initialBlogs[1]);
  await blogObject.save();
});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
}, 100000);

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs');

  expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test('a specific blog title is within the returned blogs', async () => {
  const response = await api.get('/api/blogs');

  const titles = response.body.map(r => r.title);
  expect(titles).toContain('React patterns');
});

test('blog post unique identifies is named "id"', async () => {
  const allBlogs = await helper.blogsInDb();
  const firstBlog = allBlogs[0];

  expect(firstBlog.id).toBeDefined();
});

afterAll(() => {
  mongoose.connection.close();
});
