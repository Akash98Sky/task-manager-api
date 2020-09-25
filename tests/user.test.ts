import request from 'supertest';
import app from '../src/app';
import User from '../src/models/user';
import { closeDatabase, openDatabase, setupUserDatabase, userOne, userOneId } from './fixtures/db';

beforeAll(openDatabase);

beforeEach(setupUserDatabase);

afterAll(closeDatabase);

test('Should signup new user!', async () => {
	const response = await request(app).post('/users').send({
		name: 'Sky Xyz',
		email: 'skyxyz@gmailnator.com',
		password: 'sky_xyz'
	}).expect(201);

	// Assert that db has created user correctly
	const user = await User.findById(response.body.user._id).exec();
	expect(user).not.toBeNull();

	// Assertion about response body
	expect(response.body).toMatchObject({
		user: {
			name: 'Sky Xyz',
			email: 'skyxyz@gmailnator.com'
		},
		token: user?.tokens[0].token
	})
	expect(user?.password).not.toBe('sky_xyz');
})

test('Should login existing user!', async () => {
	const response = await request(app).post('/users/login').send({
		email: userOne.email,
		password: userOne.password
	}).expect(200);

	// Assert that second token in db matches the response token
	const user = await User.findById(response.body.user._id).exec();
	expect(user).not.toBeNull();
	expect(response.body.token).toBe(user?.tokens[1].token);
})

test('Should not login nonexistant user!', async () => {
	await request(app).post('/users/login').send({
		email: 'nonexist@mail.com',
		password: 'incorrectpass'
	}).expect(400);
})

test('Should get profile for user!', async () => {
	await request(app)
		.get('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);
})

test('Should not get profile for unauthorized user!', async () => {
	await request(app)
		.get('/users/me')
		.send()
		.expect(401);
})

test('Should upload avatar image for user!', async () => {
	await request(app)
		.post('/users/me/avatar')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.attach('image', 'tests/fixtures/profile-pic.jpg')
		.expect(200);

	const user = await User.findById(userOneId).exec();
	expect(user?.avatar).toEqual(expect.any(Buffer));
})

test('Should update valid user fields!', async () => {
	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			name: 'Updated User',
		})
		.expect(200);

	const user = await User.findById(userOneId).exec();
	expect(user?.name).toBe('Updated User');
})

test('Should not update invalid user fields!', async () => {
	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			location: 'Kolkata',
		})
		.expect(400);
})

test('Should delete account for user!', async () => {
	await request(app)
		.delete('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	// Assert that user is no more in db
	const user = await User.findById(userOneId).exec();
	expect(user).toBeNull();
})

test('Should not delete account for unauthorized user!', async () => {
	await request(app)
		.delete('/users/me')
		.send()
		.expect(401);
})
