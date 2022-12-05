const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.initialBlogs);
});

describe('when there is initially some notes saved', () => {
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

  test('blog post unique identifier is named "id"', async () => {
    const allBlogs = await helper.blogsInDb();
    const firstBlog = allBlogs[0];
  
    expect(firstBlog.id).toBeDefined();
  });
});

describe('addition of a new blog', () => {
  test('succeeds with valid data', async () => {
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

  test('fails without the title property', async () => {
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
  
  test('fails without the url property', async () => {
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

  test('with no likes property defaults to zero', async () => {
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
});

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204);
    
    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

    const titles = blogsAtEnd.map(r => r.title);
    expect(titles).not.toContain(blogToDelete.title);
  });
});

describe('updating a blog', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: 999 })
      .expect(200);
    
    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);

    const updatedBlog = blogsAtEnd[0];
    expect(updatedBlog.likes).toBe(999);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
