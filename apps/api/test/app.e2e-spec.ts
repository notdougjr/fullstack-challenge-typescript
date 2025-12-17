import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('API E2E Tests', () => {
  let app: INestApplication<App>;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('AppController', () => {
    it('GET / - should return Hello World!', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('AuthController', () => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Test123456!';

    it('POST /auth/register - should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          username: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
          authToken = (res.body as { accessToken: string }).accessToken;
        });
    });

    it('POST /auth/register - should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: testPassword,
        })
        .expect(400);
    });

    it('POST /auth/login - should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
          authToken = (res.body as { accessToken: string }).accessToken;
        });
    });

    it('POST /auth/login - should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'wrong-password',
        })
        .expect(401);
    });
  });

  describe('UserController', () => {
    it('GET /user - should return 401 without token', () => {
      return request(app.getHttpServer()).get('/user').expect(401);
    });

    it('GET /user - should return all users with valid token', () => {
      return request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /user/me - should return current user', () => {
      return request(app.getHttpServer())
        .get('/user/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
        });
    });

    it('PATCH /user/me - should update current user', () => {
      return request(app.getHttpServer())
        .patch('/user/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'Updated Username',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          if ((res.body as { username?: string }).username) {
            expect((res.body as { username: string }).username).toBe(
              'Updated Username',
            );
          }
        });
    });

    it('POST /user - should create a new user', () => {
      const newUserEmail = `newuser-${Date.now()}@example.com`;
      return request(app.getHttpServer())
        .post('/user')
        .send({
          email: newUserEmail,
          password: 'Password123!',
          username: 'New User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect((res.body as { email: string }).email).toBe(newUserEmail);
        });
    });
  });
});
