import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Task from '../../src/models/task';
import User from '../../src/models/user';

export const userOneId = new mongoose.Types.ObjectId();
export const userOne = {
	_id: userOneId,
	name: 'Test User',
	email: 'testuser@gmailnator.com',
	password: 'UserPass',
	tokens: [{
		token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET as string)
	}]
}

export const userTwoId = new mongoose.Types.ObjectId();
export const userTwo = {
	_id: userTwoId,
	name: 'Second User',
	email: 'secuser@gmailnator.com',
	password: 'user2pass',
	tokens: [{
		token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET as string)
	}]
}

export const taskOne = {
	_id: new mongoose.Types.ObjectId(),
	description: 'First Task',
	completed: false,
	owner: userOne._id
}

export const taskTwo = {
	_id: new mongoose.Types.ObjectId(),
	description: 'Second Task',
	completed: true,
	owner: userOne._id
}

export const taskThree = {
	_id: new mongoose.Types.ObjectId(),
	description: 'Third Task',
	completed: true,
	owner: userTwo._id
}

export const setupDatabase = async () => {
	// connect to database
	require('../../src/db/mongoose');

	await User.deleteMany({}).exec();
	await new User(userOne).save();
	await new User(userTwo).save();

	await Task.deleteMany({}).exec();
	await new Task(taskOne).save();
	await new Task(taskTwo).save();
	await new Task(taskThree).save();
}

export const closeDatabase = async () => await mongoose.disconnect();