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

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Sample Blog Title',
    author: 'EC',
    url: 'https://www.google.com',
    likes: 10,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

  const titles = blogsAtEnd.map(r => r.title);
  expect(titles).toContain('Sample Blog Title');
});

test('blog without likes property defaults to a value of zero', async () => {
  const newBlog = {
    title: 'Sample Blog Title',
    author: 'EC',
    url: 'https://www.google.com',
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);
  
  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
  const addedBlog = blogsAtEnd[2];
  expect(addedBlog.likes).toBe(0);
});

test('blog without the title property is not added', async () => {
  const newBlog = {
    author: 'EC',
    url: 'https://www.google.com',
    likes: 10,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400);
  
  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
});

test('blog without the url property is not added', async () => {
  const newBlog = {
    title: 'Sample Blog Title',
    author: 'EC',
    likes: 10,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400);
  
  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
});

afterAll(() => {
  mongoose.connection.close();
});
