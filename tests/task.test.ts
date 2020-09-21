import request from 'supertest';
import app from '../src/app';
import Task from '../src/models/task';
import { closeDatabase, setupDatabase, taskThree, userOne, userOneId } from './fixtures/db';

beforeAll(async () => await setupDatabase());

afterAll(async () => await closeDatabase());

test('Should create task for user', async () => {
	const response = await request(app)
		.post('/tasks')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			description: 'Sample task',
		})
		.expect(201);

	const task = await Task.findById(response.body._id).exec();
	expect(task).not.toBeNull();
	expect(task?.completed).toBe(false);
})

test('Should return all tasks of a user', async () => {
	const response = await request(app)
		.get('/tasks')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.expect(200);

	const tasks: { owner: string }[] = response.body || [];
	expect(tasks.length).toBe(3);
	tasks.forEach((task) => expect(userOneId.equals(task.owner)).toBe(true));
})

test('Should not del task by other user', async () => {
	await request(app)
		.delete(`/tasks/${taskThree._id}`)
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.expect(404);

	const task = await Task.findById(taskThree._id).exec();
	expect(task).not.toBeNull();
})