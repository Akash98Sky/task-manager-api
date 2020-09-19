import { ErrorRequestHandler } from 'express';

const errorMiddleware: ErrorRequestHandler = (error: Error, _request, response, _next) => {
	const status = 400;
	const message = error.message || 'Something went wrong';
	response
		.status(status)
		.send({
			status,
			message,
		})
}

export default errorMiddleware;