const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const User = require('../models/user');

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.initialBlogs);
  await User.deleteMany({});
  const passwordHash = await bcrypt.hash('secret', 10);
  const user = new User({ username: 'admin', name: 'owner', passwordHash });
  await User.insertMany(user);
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
    const targetUser = {
      username: 'admin',
      password: 'secret'
    };

    const userResult = await api
      .post('/api/login')
      .send(targetUser)
      .expect(200);

    const { token } = userResult.body;

    const newBlog = {
      title: 'Sample Blog Title',
      author: 'EC',
      url: 'https://www.google.com',
      likes: 10,
    };
  
    await api
      .post('/api/blogs')
      .set({ Authorization: `Bearer ${token}` })
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
  
    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
  
    const titles = blogsAtEnd.map(r => r.title);
    expect(titles).toContain('Sample Blog Title');
  });

  test('fails without the title property', async () => {
    const targetUser = {
      username: 'admin',
      password: 'secret'
    };

    const userResult = await api
      .post('/api/login')
      .send(targetUser)
      .expect(200);

    const { token } = userResult.body;

    const newBlog = {
      author: 'EC',
      url: 'https://www.google.com',
      likes: 10,
    };
  
    await api
      .post('/api/blogs')
      .set({ Authorization: `Bearer ${token}` })
      .send(newBlog)
      .expect(400);
    
    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });
  
  test('fails without the url property', async () => {
    const targetUser = {
      username: 'admin',
      password: 'secret'
    };

    const userResult = await api
      .post('/api/login')
      .send(targetUser)
      .expect(200);

    const { token } = userResult.body;

    const newBlog = {
      title: 'Sample Blog Title',
      author: 'EC',
      likes: 10,
    };
  
    await api
      .post('/api/blogs')
      .set({ Authorization: `Bearer ${token}` })
      .send(newBlog)
      .expect(400);
    
    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });

  test('with no likes property defaults to zero', async () => {
    const targetUser = {
      username: 'admin',
      password: 'secret'
    };

    await api
      .post('/api/login')
      .send(targetUser)
      .expect(200);

    const newBlog = {
      title: 'Sample Blog Title',
      author: 'EC',
      url: 'https://www.google.com',
    };
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401);
    
    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });
});

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if user owns the blog', async () => {
    const targetUser = {
      username: 'admin',
      password: 'secret'
    };

    const userResult = await api
      .post('/api/login')
      .send(targetUser)
      .expect(200);

    const { token } = userResult.body;

    const newBlog = {
      title: "Dogs are better than cats!",
      author: "Mr. Dog",
      url: "https://www.dogs.com",
      likes: 33235345234,
    };

    await api
      .post('/api/blogs')
      .set({ Authorization: `Bearer ${token}` })
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[2];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(204);
    
    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);

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

describe('creation of a user', () => {
  test('succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'sampleusername',
      name: 'john doe',
      password: 'password',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map(u => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test('fails with a duplicate username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
        username: 'admin',
        name: 'duplicate',
        password: 'secret',
    };

    const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('Username must be unique');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
