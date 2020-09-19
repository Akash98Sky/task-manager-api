import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export const sendWelcomeMail = (email: string, name: string = 'User') => sgMail.send({
	from: 'Task App <admin@akash98sky.heliohost.org>',
	to: email,
	subject: 'Thanks for joining in!',
	text: `Welcome to the app, ${name}. Let me know how you get along with the app`
});

export const sendCancelationMail = (email: string, name: string = 'User') => sgMail.send({
	from: 'Task App <admin@akash98sky.heliohost.org>',
	to: email,
	subject: 'Sorry to see you go!',
	text: `Goodbye, ${name}. I hope to see you back sometime soon.`
});