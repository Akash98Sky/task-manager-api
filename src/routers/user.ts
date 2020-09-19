import express from 'express'
import User from '../models/user'
import auth from '../middleware/auth'
import { avatarUpload } from '../middleware/upload';
import errorMiddleware from '../middleware/error';
import AuthRequest from '../models/auth';
import sharp from 'sharp';
import { sendCancelationMail, sendWelcomeMail } from '../email/account';

const router = express.Router();

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeMail(user.email, user.name);
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req: AuthRequest, res) => {
    try {
        req.user?.tokens.splice(req.user?.tokens.findIndex((value) => value.token === req.token), 1);
        await req.user?.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req: AuthRequest, res) => {
    try {
        req.user?.tokens.splice(0);
        await req.user?.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req: AuthRequest, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req: AuthRequest, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        req.user?.set(req.body)
        await req.user?.save()

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req: AuthRequest, res) => {
    try {
        if (req.user) {
            await req.user.remove()
            sendCancelationMail(req.user.email, req.user.name);
        }

        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/me/avatar', auth, avatarUpload.single('image'),
    async (req: AuthRequest, res: express.Response) => {
        const avatar = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();

        req.user?.set({ avatar });
        await req.user?.save();

        res.send();
    }, errorMiddleware);

router.delete('/users/me/avatar', auth,
    async (req: AuthRequest, res: express.Response) => {
        req.user?.set({ avatar: undefined });
        await req.user?.save();

        res.send();
    }, errorMiddleware);

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).exec();

        if (!user?.avatar) {
            throw new Error();
        }

        res.setHeader('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send()
    }
});

export default router;